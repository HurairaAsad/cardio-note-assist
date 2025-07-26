import Anthropic from '@anthropic-ai/sdk';
import { DocumentProcessor, DocumentProcessingResult } from './documentProcessor';

export interface MedicalExtractionResult {
  success: boolean;
  extractedNote?: string;
  error?: string;
  sourceMetadata?: any;
  validation?: {
    isMedical: boolean;
    confidence: number;
    reason?: string;
  };
}

const COMPREHENSIVE_MEDICAL_EXTRACTION_PROMPT = `You are a specialized medical information extraction system with advanced capabilities to process and organize medical documents. Extract and organize the following information into a comprehensive structured format.

**CRITICAL INSTRUCTIONS:**
1. Extract ALL available information from the document, even if formatting is imperfect
2. Use medical knowledge to interpret abbreviated terms and correct obvious OCR errors
3. Maintain strict medical accuracy while filling in standard medical note structure
4. If specific information is not available, note it as "Not documented" rather than omitting sections

**AGE CALCULATION REQUIREMENTS - CRITICAL:**
- ALWAYS calculate age accurately using this exact formula: Age = (Service Date Year - Birth Year) minus 1 if birthday hasn't occurred yet in the service year
- Example 1: DOB 06/20/1974, Service Date 07/23/2025 → Age = 2025 - 1974 = 51 (birthday already passed in 2025)
- Example 2: DOB 12/15/1980, Service Date 03/10/2025 → Age = 2025 - 1980 - 1 = 44 (birthday hasn't occurred yet in 2025)
- VALIDATION: Age must be between 0-120 years. If calculated age seems unreasonable, double-check your calculation
- FORMAT: Always display as "XX-year-old" (e.g., "51-year-old female")
- SHOW YOUR WORK: Include the calculation in your thinking process to ensure accuracy

**REQUIRED EXTRACTION SECTIONS:**

## PATIENT DEMOGRAPHICS
- Full name, DOB, age, gender, MR#/Patient ID
- Admission/service dates, room number, facility information
- Insurance information, emergency contacts
- Attending physicians and care team

## PRIMARY & SECONDARY DIAGNOSES
- Current active diagnoses with ICD-10 codes if available
- Past medical history with dates
- Chronological progression of conditions
- Comorbidities and risk factors

## CURRENT MEDICATIONS
- All medications with exact dosages, frequencies, and routes
- Recent medication changes with rationale
- PRN medications with specific parameters
- Allergies and adverse drug reactions

## VITAL SIGNS & CLINICAL MEASUREMENTS
- Most recent vital signs with dates and times
- Trending values (daily weights, I/O, pain scores)
- Physical examination findings by system
- Functional status and mobility assessment

## CLINICAL COURSE & EVENTS
- Major medical events during admission/care period
- Procedures, interventions, and surgeries with dates
- Complications and responses to treatment
- Consultations and specialist recommendations

## LABORATORY & DIAGNOSTIC RESULTS
- Recent lab values with dates, times, and reference ranges
- Trending patterns and significant changes
- Imaging studies with findings and interpretations
- Cardiac studies (EKG, Echo, stress tests) with specific measurements

## SPECIALIZED ASSESSMENTS
- Cardiac function (EF, wall motion, valve function)
- Neurological status and cognitive assessment
- Wound care and skin integrity
- Nutritional status and dietary needs

## TREATMENT PLANS & INTERVENTIONS
- Current treatment protocols and guidelines being followed
- Therapy plans (PT, OT, speech, cardiac rehab)
- Monitoring parameters and frequency
- Patient education provided

## DISCHARGE PLANNING & FOLLOW-UP
- Discharge disposition and planned date
- Follow-up appointments scheduled
- Home care services arranged
- Equipment or supply needs

## COMMUNICATION & SPECIAL CONSIDERATIONS
- Family involvement and communication preferences
- Advance directives and code status
- Cultural or religious considerations
- Barriers to care or treatment compliance

**FORMATTING REQUIREMENTS:**
- Use clear, consistent medical terminology
- Include specific dates, times, and measurements with units
- Organize chronologically within each section
- Note source of information when multiple visits/entries exist
- Highlight critical values or concerning findings

**DOCUMENT TEXT TO ANALYZE:**
{document_text}

Generate a comprehensive medical note using the above structure and the actual information extracted from this document. Ensure all standard medical note sections are included, properly formatted, and medically accurate.`;

const CARDIOLOGY_SPECIFIC_PROMPT = `You are a specialized cardiology medical information extraction system. Create a comprehensive CARDIOLOGY PROGRESS NOTE using all available information from the document.

**AGE CALCULATION REQUIREMENTS - CRITICAL:**
- ALWAYS calculate age accurately using this exact formula: Age = (Service Date Year - Birth Year) minus 1 if birthday hasn't occurred yet in the service year
- Example 1: DOB 06/20/1974, Service Date 07/23/2025 → Age = 2025 - 1974 = 51 (birthday already passed in 2025)
- Example 2: DOB 12/15/1980, Service Date 03/10/2025 → Age = 2025 - 1980 - 1 = 44 (birthday hasn't occurred yet in 2025)
- VALIDATION: Age must be between 0-120 years. If calculated age seems unreasonable, double-check your calculation
- FORMAT: Always display as "XX-year-old" (e.g., "51-year-old female")
- SHOW YOUR WORK: Include the calculation in your thinking process to ensure accuracy

**REQUIRED OUTPUT FORMAT - FOLLOW EXACTLY:**

**Header:**
Patient Name: [Extract full name]
DOB: [Extract MM/DD/YYYY]
Date of Service: [Extract MM/DD/YYYY]
On consult for: Cardiac Management
Code status: [Extract or indicate "Full code"]

**History of Present Illness:**
[Comprehensive cardiac history with timeline of events, current symptoms, and functional status]

**Visits:**
(DOS - Date of Service): *Enable NP to input free text every single encounter*

**Review of Systems:**
General: (Y/N) weight change, (Y/N) generally healthy, (Y/N) change in strength or exercise tolerance
Head: (Y/N) headaches, (Y/N) vertigo, (Y/N) injury
Eyes: (Y/N) Normal vision, (Y/N) diplopia, (Y/N) tearing, (Y/N) scotomata, (Y/N) pain
Ears: (Y/N) change in hearing, (Y/N) tinnitus, (Y/N) bleeding, (Y/N) vertigo
Nose: (Y/N) epistaxis, (Y/N) coryza, (Y/N) obstruction, (Y/N) discharge
Mouth: (Y/N) dental difficulties, (Y/N) gingival bleeding, (Y/N) use of dentures
Neck: (Y/N) stiffness, (Y/N) pain, (Y/N) tenderness, (Y/N) noted masses
Chest: (Y/N) dyspnea, (Y/N) wheezing, (Y/N) hemoptysis, (Y/N) cough
Heart: (Y/N) chest discomfort, (Y/N) palpitations, (Y/N) syncope, (Y/N) orthopnea
Abdomen: (Y/N) change in appetite, (Y/N) dysphagia, (Y/N) abdominal pains, (Y/N) bowel habit changes, (Y/N) emesis, (Y/N) melena
GU: (Y/N) urinary urgency, (Y/N) dysuria, (Y/N) change in nature of urine
Musculoskeletal: (Y/N) pain in muscles or joints, (Y/N) limitation of range of motion, (Y/N) paresthesias or numbness
Neurologic: (Y/N) weakness, (Y/N) tremor, (Y/N) seizures, (Y/N) changes in mentation, (Y/N) ataxia
Psychiatric: (Y/N) depressive symptoms, (Y/N) changes in sleep habits, (Y/N) changes in thought content

**Past Surgical History:**
[List all prior surgeries with dates, especially cardiac procedures]

**Family History:**
[Cardiac disease in family members, hereditary conditions]

**Social History:**
[Smoking, alcohol, drug use, exercise tolerance, occupation]

**Physical Exam:**
Vitals: Weight: ___lbs, BP __/__, Pulse ___bpm, ___RR, ___O2 sats
General: (Y/N) Alert & Oriented x3, (Y/N) Not in any acute distress, (Y/N) well appearing
Head: (Y/N) Normocephalic, (Y/N) atraumatic, (Y/N) no lesions
Eyes: (Y/N) PERRLA, (Y/N) EOM intact, (Y/N) conjunctivae clear
Ears: (Y/N) drainage, (Y/N) lesions, (Y/N) Hearing intact
Nose: (Y/N) Mucosa normal, (Y/N) obstruction, (Y/N) epistaxis
Throat: (Y/N) Clear, (Y/N) exudates, (Y/N) lesions
Neck: (Y/N) Supple, (Y/N) lymphadenopathy, (Y/N) JVD, (Y/N) masses
Chest: (Y/N) Lungs clear to auscultation bilaterally, (Y/N) rales, (Y/N) rhonchi, (Y/N) wheezes
Heart: (Y/N) RR, (Y/N) murmurs, (Y/N) rubs, (Y/N) gallops
Abdomen: (Y/N) Soft, (Y/N) Nontender, (Y/N) masses, (Y/N) BS normal
Back: (Y/N) Normal curvature, (Y/N) tenderness
Extremities: (Y/N) full range of motion, (Y/N) deformities, (Y/N) edema, (Y/N) erythema
Neuro: (Y/N) focal deficits, (Y/N) Equal strength in all extremities
Skin: (Y/N) Normal, (Y/N) rashes, (Y/N) lesions noted

**Medications (Cardiac):**
[Name, Dose, Frequency for each medication]

**Labs & Imaging Results:**
[Include EXACT dates and reference values in parentheses. Example: "7/18/25 BUN 43 (ref: 7-20), Creat 0.9 (ref: 0.6-1.2), Na 142 (ref: 136-145), K 3.8 (ref: 3.5-5.0)"]

**Assessment:**
[Numbered list of diagnoses with supporting evidence and clinical reasoning]

**Plan:**
[Specific management plans, medication adjustments, follow-up recommendations]

**Signoff:**
[Provider name and credentials, supervising physician if applicable, time spent]

**CRITICAL INSTRUCTIONS:**
- Fill in Y or N for each Review of Systems and Physical Exam item based on document findings
- If information is not documented, use "N" for negative findings and note "Not documented" for unclear items
- Include EXACT dates for all lab results with reference values in parentheses
- Use the numbered assessment format with detailed explanations
- Maintain professional medical terminology throughout
- Calculate age precisely and show your work

**DOCUMENT TEXT:**
{document_text}

Extract all available information and create a comprehensive cardiology progress note following the above EXACT format.`;

export class MedicalRecordExtractor {
  private anthropic: Anthropic;
  private documentProcessor: DocumentProcessor;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    this.documentProcessor = new DocumentProcessor();
  }

  /**
   * Complete pipeline: file processing + medical extraction
   */
  async extractMedicalInfo(
    file: File, 
    templateType: string = 'general'
  ): Promise<MedicalExtractionResult> {
    try {
      // Step 1: Extract text from document
      console.log('Processing document...', file.name);
      const processingResult = await this.documentProcessor.processFile(file);
      
      if (!processingResult.success || !processingResult.text) {
        return {
          success: false,
          error: processingResult.error || 'Failed to extract text from document',
          sourceMetadata: processingResult.metadata
        };
      }

      console.log(`Extracted ${processingResult.text.length} characters from document`);

      // Step 2: Validate medical content
      const validation = this.documentProcessor.validateMedicalContent(processingResult.text);
      
      if (!validation.isValid) {
      return {
        success: false,
        error: validation.reason || 'Document does not appear to contain medical information',
        validation: {
          isMedical: validation.isValid,
          confidence: validation.confidence,
          reason: validation.reason
        },
        sourceMetadata: processingResult.metadata
      };
      }

      // Step 3: Extract medical information using Claude
      console.log('Analyzing medical content with Claude AI...');
      const extractionResult = await this.processMedicalText(
        processingResult.text, 
        templateType
      );

      return {
        ...extractionResult,
        validation: {
          isMedical: validation.isValid,
          confidence: validation.confidence,
          reason: validation.reason
        },
        sourceMetadata: processingResult.metadata
      };

    } catch (error) {
      return {
        success: false,
        error: `Medical extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process extracted text with Claude API for medical information
   */
  private async processMedicalText(
    documentText: string, 
    templateType: string
  ): Promise<MedicalExtractionResult> {
    try {
      // Choose appropriate prompt based on template type
      const prompt = templateType.toLowerCase().includes('cardiology') 
        ? CARDIOLOGY_SPECIFIC_PROMPT.replace('{document_text}', documentText)
        : COMPREHENSIVE_MEDICAL_EXTRACTION_PROMPT.replace('{document_text}', documentText);

      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        temperature: 0.1,
        system: "You are an experienced physician and medical information specialist with advanced medical reasoning capabilities. Create comprehensive, accurate medical documentation based on provided source material. Use superior clinical knowledge to interpret complex medical data, correct OCR errors, and fill knowledge gaps. Maintain strict medical accuracy while organizing information clearly and professionally.",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const extractedNote = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';

      if (!extractedNote) {
        return {
          success: false,
          error: 'Claude API returned empty response'
        };
      }

      return {
        success: true,
        extractedNote: extractedNote
      };

    } catch (error: any) {
      console.error('Claude API Error:', error);
      
      let errorMessage = 'Claude API error';
      if (error?.status === 401) {
        errorMessage = 'Invalid API key. Please check your Claude API configuration.';
      } else if (error?.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again in a moment.';
      } else if (error?.status === 400) {
        errorMessage = 'Invalid request. The document content may be too large or contain unsupported characters.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get detailed diagnostic information about a file
   */
  async diagnoseFile(file: File): Promise<any> {
    return await this.documentProcessor.diagnoseFile(file);
  }

  /**
   * Validate medical content in text
   */
  validateMedicalContent(text: string) {
    return this.documentProcessor.validateMedicalContent(text);
  }

  async generateFinalNoteWithROS(extractedData: string, template: string, rosData: any): Promise<string> {
    try {
      // Format ROS data into readable text
      const formattedROS = this.formatReviewOfSystems(rosData);
      
      const finalPrompt = `${this.getTemplatePrompt(template)}

EXTRACTED MEDICAL DATA:
${extractedData}

REVIEW OF SYSTEMS ASSESSMENT:
${formattedROS}

INSTRUCTIONS:
1. Use the extracted medical data as the primary source
2. Integrate the Review of Systems assessment into the appropriate section
3. Format according to the template requirements with proper headings
4. Include dates and reference values for all lab results
5. Ensure Y/N indicators are clearly shown for all ROS items
6. Generate a professional, comprehensive clinical note

Please generate the final clinical note now:`;

      const response = await this.anthropic.messages.create({
        model: 'claude-opus-4-20250514',
        max_tokens: 8000,
        temperature: 0.1,
        system: "You are an expert physician with superior clinical reasoning and documentation skills. Generate comprehensive, professional medical notes by intelligently combining extracted data with clinical assessments. Ensure perfect medical accuracy, proper formatting, and clinical coherence.",
        messages: [{
          role: 'user',
          content: finalPrompt
        }]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Final note generation error:', error);
      throw new Error(`Failed to generate final note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatReviewOfSystems(rosData: any): string {
    const sections = [
      { key: 'general', title: 'General' },
      { key: 'head', title: 'Head' },
      { key: 'eyes', title: 'Eyes' },
      { key: 'ears', title: 'Ears' },
      { key: 'nose', title: 'Nose' },
      { key: 'mouth', title: 'Mouth' },
      { key: 'neck', title: 'Neck' },
      { key: 'chest', title: 'Chest' },
      { key: 'heart', title: 'Heart' },
      { key: 'abdomen', title: 'Abdomen' },
      { key: 'gu', title: 'GU' },
      { key: 'musculoskeletal', title: 'Musculoskeletal' },
      { key: 'neurologic', title: 'Neurologic' },
      { key: 'psychiatric', title: 'Psychiatric' }
    ];

    let formatted = "Review of Systems:\n";
    
    sections.forEach(section => {
      if (rosData[section.key]) {
        formatted += `${section.title}: `;
        const items = Object.entries(rosData[section.key])
          .map(([item, value]) => `(${value ? 'Y' : 'N'}) ${item}`)
          .join(', ');
        formatted += items + '\n';
      }
    });

    return formatted;
  }

  private getTemplatePrompt(template: string): string {
    if (template.toLowerCase().includes('cardiology')) {
      return CARDIOLOGY_SPECIFIC_PROMPT.replace('{document_text}', '');
    }
    return COMPREHENSIVE_MEDICAL_EXTRACTION_PROMPT.replace('{document_text}', '');
  }

  async generateFinalNoteWithAllData(
    extractedData: string, 
    template: string, 
    rosData: any, 
    physicalExamData: any, 
    visitsData: any
  ): Promise<string> {
    try {
      // Format all collected data
      const formattedROS = this.formatReviewOfSystems(rosData);
      const formattedPhysicalExam = this.formatPhysicalExam(physicalExamData);
      const formattedVisits = this.formatVisits(visitsData);
      
      const finalPrompt = `${this.getTemplatePrompt(template)}

EXTRACTED MEDICAL DATA:
${extractedData}

REVIEW OF SYSTEMS ASSESSMENT:
${formattedROS}

PHYSICAL EXAMINATION:
${formattedPhysicalExam}

VISITS DOCUMENTATION:
${formattedVisits}

INSTRUCTIONS:
1. Use the extracted medical data as the primary source
2. Integrate the Review of Systems assessment into the appropriate section
3. Include the Physical Examination findings with vitals and Y/N indicators
4. Add the Visits documentation in the appropriate section
5. Format according to the template requirements with proper headings
6. Include dates and reference values for all lab results
7. Ensure Y/N indicators are clearly shown for all ROS and Physical Exam items
8. Generate a professional, comprehensive clinical note

Please generate the final clinical note now:`;

      const response = await this.anthropic.messages.create({
        model: 'claude-opus-4-20250514',
        max_tokens: 8000,
        temperature: 0.1,
        system: "You are an expert physician with superior clinical reasoning and documentation skills. Generate comprehensive, professional medical notes by intelligently combining extracted data with clinical assessments. Ensure perfect medical accuracy, proper formatting, and clinical coherence.",
        messages: [{
          role: 'user',
          content: finalPrompt
        }]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Final note generation error:', error);
      throw new Error(`Failed to generate final note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatPhysicalExam(examData: any): string {
    if (!examData) return '';

    let formatted = "Physical Exam:\n";
    
    // Vitals
    if (examData.vitals) {
      formatted += `Vitals: Weight: ${examData.vitals.weight || '___'}lbs, BP ${examData.vitals.bp || '___/___'}, Pulse ${examData.vitals.pulse || '___'}bpm, ${examData.vitals.rr || '___'}RR, ${examData.vitals.o2sats || '___'}O2 sats\n`;
    }

    // Physical exam sections
    const sections = [
      { key: 'general', title: 'General' },
      { key: 'head', title: 'Head' },
      { key: 'eyes', title: 'Eyes' },
      { key: 'ears', title: 'Ears' },
      { key: 'nose', title: 'Nose' },
      { key: 'throat', title: 'Throat' },
      { key: 'neck', title: 'Neck' },
      { key: 'chest', title: 'Chest' },
      { key: 'heart', title: 'Heart' },
      { key: 'abdomen', title: 'Abdomen' },
      { key: 'back', title: 'Back' },
      { key: 'extremities', title: 'Extremities' },
      { key: 'neuro', title: 'Neuro' },
      { key: 'skin', title: 'Skin' }
    ];

    sections.forEach(section => {
      if (examData[section.key] && typeof examData[section.key] === 'object') {
        formatted += `${section.title}: `;
        const items = Object.entries(examData[section.key])
          .map(([item, value]) => `(${value ? 'Y' : 'N'}) ${item}`)
          .join(', ');
        formatted += items + '\n';
      }
    });

    return formatted;
  }

  private formatVisits(visitsData: any): string {
    if (!visitsData || !visitsData.visits) return '';

    let formatted = "Visits:\n";
    
    visitsData.visits.forEach((visit: any, index: number) => {
      formatted += `(DOS - ${visit.date}): ${visit.note}\n`;
    });

    return formatted;
  }
}