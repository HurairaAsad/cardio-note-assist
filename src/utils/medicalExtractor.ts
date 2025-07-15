import Anthropic from '@anthropic-ai/sdk';
import { DocumentProcessor, DocumentProcessingResult } from './documentProcessor';

export interface MedicalExtractionResult {
  success: boolean;
  extractedNote?: string;
  error?: string;
  documentType?: 'medical_content' | 'table_of_contents' | 'unknown';
  recommendation?: string;
  tableOfContents?: string[];
  formatValidation?: {
    isValid: boolean;
    missingHeaders: string[];
  };
  sourceMetadata?: any;
  validation?: {
    isMedical: boolean;
    confidence: number;
    reason?: string;
  };
}

const COMPREHENSIVE_MEDICAL_EXTRACTION_PROMPT = `You are a specialized medical information extraction system with advanced capabilities to process and organize medical documents. Extract and organize ALL available information into a comprehensive structured format.

**CRITICAL INSTRUCTIONS:**
1. Extract ALL available information from the document, even if it appears to be a table of contents or summary
2. Use medical knowledge to interpret abbreviated terms, correct obvious OCR errors, and infer standard medical information
3. If the document contains patient demographics, diagnoses, medications, or any clinical data - extract it ALL
4. For documents that appear to be face sheets or summaries, extract whatever medical information is present
5. If specific information is not available, note it as "Not documented" rather than omitting sections
6. Be aggressive in finding and extracting any medical content, regardless of document format

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

Generate a comprehensive medical note using the above structure and the actual information extracted from this document. Extract ALL available medical information, even if the document appears to be a summary or table of contents.`;

const CARDIOLOGY_SPECIFIC_PROMPT = `You are a specialized cardiology medical information extraction system. Create a comprehensive CARDIOLOGY PROGRESS NOTE using all available information from the document.

**CARDIOLOGY-SPECIFIC REQUIREMENTS:**

1. **Cardiac History Focus**
   - Previous MI, CABG, PCI with dates and details
   - Heart failure history and classification (NYHA, ACC/AHA stages)
   - Arrhythmia history and interventions
   - Valvular disease and interventions

2. **Cardiac Medications Analysis**
   - ACE inhibitors/ARBs with current doses and target doses
   - Beta-blockers with heart rate control assessment
   - Diuretics with volume status monitoring
   - Anticoagulation with INR targets if applicable

3. **Cardiac Function Assessment**
   - Ejection fraction trends and measurement dates
   - Wall motion abnormalities
   - Valve function (stenosis/regurgitation severity)
   - Pulmonary pressures if available

4. **Cardiovascular Risk Factors**
   - Diabetes management and HbA1c targets
   - Hypertension control and BP targets
   - Lipid management and statin therapy
   - Smoking cessation efforts

**OUTPUT FORMAT:**
CARDIOLOGY PROGRESS NOTE

Patient Name: [Extract full name]
DOB: [Extract date of birth] 
Date of Service: [Extract service date]
MR#: [Extract if available]
Location: [Extract facility/unit]
On consult for: [Extract reason or "Cardiac management"]
Code status: [Extract if documented]

History of Present Illness:
[Comprehensive cardiac history with timeline of events, current symptoms, and functional status]

Previous Visits/Clinical Course:
[Chronological listing of all documented visits with dates and key findings]

Review of Systems:
[Cardiovascular-focused ROS with specific attention to chest pain, dyspnea, palpitations, syncope, edema]

Past Medical History:
[Cardiac and relevant non-cardiac conditions with dates]

Past Surgical/Procedural History:
[All cardiac procedures, surgeries, and interventions with dates and details]

Family History:
[Relevant cardiac family history]

Social History:
[Risk factors including smoking, alcohol, exercise tolerance]

Physical Examination:
Vitals: [Include BP, HR, weight with trends, O2 saturation]
General: [Overall appearance and functional status]
Cardiovascular: [Detailed cardiac exam including heart sounds, murmurs, JVD, peripheral edema]
Pulmonary: [Lung sounds, breathing pattern]
Extremities: [Edema assessment, pulse examination]
[Other relevant systems]

Current Medications:
[Complete cardiac medication list with doses and frequencies, noting optimization opportunities]

Laboratory/Diagnostic Results:
[Recent cardiac biomarkers, BNP/NT-proBNP, lipid panel, HbA1c, renal function]
[ECG findings with interpretation]
[Echocardiogram results with specific measurements]
[Other cardiac imaging results]

Assessment and Plan:
[Problem-based approach for each cardiac condition with specific management plans]

Provider Information:
[Extract provider details and practice information]

Time Documentation:
[Extract time spent if documented]

**DOCUMENT TEXT:**
{document_text}

Extract all available information and create a comprehensive cardiology progress note following the above format.`;

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
          documentType: processingResult.documentType,
          sourceMetadata: processingResult.metadata
        };
      }

      console.log(`Extracted ${processingResult.text.length} characters from document`);

      // Step 2: Validate medical content - be more permissive for TOC documents
      const validation = this.documentProcessor.validateMedicalContent(processingResult.text);
      
      // If it's a TOC document, lower the threshold for medical content validation
      const isTableOfContents = processingResult.documentType === 'table_of_contents';
      const shouldProceed = validation.isValid || 
        (isTableOfContents && processingResult.text.length > 200); // Process TOC if it has substantial text
      
      if (!shouldProceed && !isTableOfContents) {
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

      // Step 4: Validate format of extracted note
      const formatValidation = this.validateNoteFormat(extractionResult.extractedNote || '', templateType);

      return {
        ...extractionResult,
        documentType: processingResult.documentType,
        formatValidation,
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
        model: "claude-3-5-haiku-20241022",
        max_tokens: 4000,
        temperature: 0.1,
        system: "You are an experienced physician and medical information specialist. Create comprehensive, accurate medical documentation based on provided source material. Maintain medical accuracy while organizing information clearly.",
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

  /**
   * Validate the format of extracted medical note
   */
  private validateNoteFormat(note: string, templateType: string): { isValid: boolean; missingHeaders: string[] } {
    const generalHeaders = [
      'Patient Information', 'Demographics', 'Diagnoses', 'Medications', 
      'Physical Exam', 'Assessment', 'Plan'
    ];
    
    const cardiologyHeaders = [
      'CARDIOLOGY PROGRESS NOTE', 'Patient Name:', 'History of Present Illness',
      'Physical Examination', 'Current Medications', 'Assessment and Plan'
    ];
    
    const requiredHeaders = templateType.toLowerCase().includes('cardiology') 
      ? cardiologyHeaders 
      : generalHeaders;
    
    const missingHeaders: string[] = [];
    const noteLower = note.toLowerCase();
    
    requiredHeaders.forEach(header => {
      if (!noteLower.includes(header.toLowerCase())) {
        missingHeaders.push(header);
      }
    });
    
    return {
      isValid: missingHeaders.length <= 2, // Allow for some variation
      missingHeaders
    };
  }

  /**
   * Format enhancement for better medical note structure
   */
  async enhanceNoteFormat(note: string, templateType: string): Promise<string> {
    const formatPrompt = `
Take this medical information and reformat it EXACTLY in the proper medical note structure.

**For ${templateType.toUpperCase()} template, ensure:**
- Proper section headers with consistent formatting
- Clear patient demographics section
- Chronological organization of clinical information
- Proper medical terminology and abbreviations
- Complete medication lists with dosages
- Structured assessment and plan

**Source Medical Information:**
${note}

Please reformat this into a properly structured medical note with all required sections.`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 3000,
        temperature: 0.0,
        messages: [{ role: "user", content: formatPrompt }]
      });

      return response.content[0]?.type === 'text' ? response.content[0].text : note;
    } catch (error) {
      console.warn('Format enhancement failed:', error);
      return note; // Return original if enhancement fails
    }
  }
}