import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractRequest {
  documentText?: string;
  ccdText?: string;
  dischargeText?: string;
  templateType?: string;
  userProfile?: {
    full_name?: string;
    license_number?: string;
    specialty?: string;
  };
  extractionType?: 'single' | 'dual';
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
{signoff_info}

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

const DUAL_DOCUMENT_SYNTHESIS_PROMPT = `You are processing TWO complementary medical documents:

DOCUMENT 1 - CCD (Continuity of Care):
- Contains: Historical data, baseline medications, allergies, past medical history
- May lack: Recent procedures, updated medications, latest lab results

DOCUMENT 2 - Hospital Discharge Summary:
- Contains: Recent procedures, updated medications, latest hospital stay details
- May lack: Comprehensive historical context, family history, social history

SYNTHESIS INSTRUCTIONS:
1. Extract historical/baseline info primarily from CCD
2. Extract recent/updated info primarily from Discharge Summary
3. When conflicts exist, prioritize Discharge Summary for recent changes
4. Merge medication lists (baseline + new additions/changes)
5. Combine all available information into comprehensive clinical note

**CRITICAL AGE CALCULATION - APPLY TO BOTH DOCUMENTS:**
- ALWAYS calculate age accurately using this exact formula: Age = (Service Date Year - Birth Year) minus 1 if birthday hasn't occurred yet in the service year
- Use the most recent service date from either document
- FORMAT: Always display as "XX-year-old" (e.g., "51-year-old female")

**CCD DOCUMENT TEXT:**
{ccd_text}

**DISCHARGE SUMMARY TEXT:**
{discharge_text}

**SYNTHESIS REQUIREMENTS:**
- Merge demographics (use most recent/complete data)
- Combine past medical history with recent hospital course
- Reconcile medication lists (show discontinued, new, and continued medications)
- Integrate all available lab results with dates
- Synthesize assessment and plan incorporating both historical and recent data
- Maintain chronological order for events and procedures
- Note source of information when relevant (e.g., "Per CCD history..." or "Per recent discharge...")

Generate a comprehensive clinical note that intelligently combines information from both documents, following standard medical note formatting.`;

function generateSignoffInfo(userProfile?: { full_name?: string; license_number?: string; specialty?: string }): string {
  if (!userProfile) {
    return `Electronically signed by: [Provider Name]\nDate: ${new Date().toLocaleDateString()}\nLicense: [License Number]`;
  }

  const providerName = userProfile.full_name || "[Provider Name]";
  const licenseNumber = userProfile.license_number || "[License Number]";
  const specialty = userProfile.specialty || "Healthcare Provider";
  const currentDate = new Date().toLocaleDateString();

  return `Electronically signed by: ${providerName}, ${specialty}\nDate: ${currentDate}\nLicense: ${licenseNumber}`;
}

function getTemplatePrompt(templateType: string): string {
  switch (templateType) {
    case 'cardiology':
      return CARDIOLOGY_SPECIFIC_PROMPT;
    case 'general':
    default:
      return COMPREHENSIVE_MEDICAL_EXTRACTION_PROMPT;
  }
}

function truncateDocument(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncationPoint = maxLength - 100;
  let truncated = text.substring(0, truncationPoint);
  
  const lastParagraph = truncated.lastIndexOf('\n\n');
  if (lastParagraph > truncationPoint * 0.8) {
    truncated = truncated.substring(0, lastParagraph);
  }
  
  return truncated + '\n\n[Document truncated due to length. Analysis continues with available content...]';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const { documentText, ccdText, dischargeText, templateType = 'general', userProfile, extractionType = 'single' } = await req.json() as ExtractRequest;

    let prompt: string;
    let messages: any[];

    if (extractionType === 'dual' && ccdText && dischargeText) {
      // Dual document processing
      const MAX_CONTENT_LENGTH = 50000;
      const truncatedCcdText = truncateDocument(ccdText, MAX_CONTENT_LENGTH / 2);
      const truncatedDischargeText = truncateDocument(dischargeText, MAX_CONTENT_LENGTH / 2);
      
      const signoffInfo = generateSignoffInfo(userProfile);
      
      prompt = DUAL_DOCUMENT_SYNTHESIS_PROMPT
        .replace('{ccd_text}', truncatedCcdText)
        .replace('{discharge_text}', truncatedDischargeText)
        .replace('{signoff_info}', signoffInfo);

      messages = [
        {
          role: 'user',
          content: prompt
        }
      ];
    } else {
      // Single document processing
      if (!documentText) {
        throw new Error('Document text is required for single document processing');
      }

      const MAX_CONTENT_LENGTH = 100000;
      const truncatedText = truncateDocument(documentText, MAX_CONTENT_LENGTH);
      const signoffInfo = generateSignoffInfo(userProfile);
      
      prompt = getTemplatePrompt(templateType)
        .replace('{document_text}', truncatedText)
        .replace('{signoff_info}', signoffInfo);

      messages = [
        {
          role: 'user',
          content: prompt
        }
      ];
    }

    console.log('Making request to Anthropic API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.1,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const extractedNote = data.content[0]?.text;

    if (!extractedNote) {
      throw new Error('No content received from Claude API');
    }

    console.log('Successfully extracted medical information');

    return new Response(JSON.stringify({
      success: true,
      extractedNote: extractedNote,
      sourceMetadata: {
        model: 'claude-3-5-sonnet-20241022',
        extractionType,
        templateType,
        processingTimestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-medical-info function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});