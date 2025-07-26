import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface DocumentProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: {
    pageCount?: number;
    fileSize: number;
    fileName: string;
    extractionMethod: string;
    processingTime?: number;
    medicalValidation?: {
      isValid: boolean;
      confidence: number;
      reason?: string;
    };
  };
}

export class DocumentProcessor {
  /**
   * Extract text from PDF using PDF.js with OCR fallback
   */
  async extractTextFromPDF(file: File): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    
    try {
      console.log('Starting PDF text extraction...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const pageCount = pdf.numPages;
      
      console.log(`Processing ${pageCount} pages with standard extraction...`);
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Combine text items into readable text
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
          }
        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
        }
      }
      
      const cleanedText = this.cleanExtractedText(fullText);
      const processingTime = Date.now() - startTime;
      
      // If standard extraction yielded minimal content, try OCR
      if (cleanedText.length < 100) {
        console.log('Standard extraction yielded minimal content. Attempting OCR...');
        return await this.extractTextWithOCR(file, 'text-fallback');
      }
      
      const medicalValidation = this.validateMedicalContent(cleanedText);
      
      return {
        success: true,
        text: cleanedText,
        metadata: {
          pageCount,
          fileSize: file.size,
          fileName: file.name,
          extractionMethod: 'PDF.js (standard)',
          processingTime,
          medicalValidation
        }
      };
      
    } catch (error) {
      console.error('PDF extraction failed, trying OCR fallback:', error);
      return await this.extractTextWithOCR(file, 'error-fallback');
    }
  }

  /**
   * Extract text from PDF using OCR (for scanned documents)
   */
  async extractTextWithOCR(file: File, reason?: string): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    
    try {
      console.log(`Starting OCR extraction (${reason || 'manual'})...`);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const pageCount = pdf.numPages;
      
      console.log(`OCR processing ${pageCount} pages...`);
      
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          console.log(`OCR processing page ${pageNum}/${pageCount}...`);
          
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          
          // Create canvas for rendering
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          // Render PDF page to canvas
          await page.render({ canvasContext: context, viewport }).promise;
          
          // OCR the canvas image
          const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                console.log(`Page ${pageNum}: ${Math.round(m.progress * 100)}% OCR complete`);
              }
            }
          });
          
          if (text.trim()) {
            fullText += `--- Page ${pageNum} (OCR) ---\n${text}\n\n`;
          }
          
          console.log(`Page ${pageNum} OCR complete: ${text.length} characters extracted`);
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum} with OCR:`, pageError);
          continue;
        }
      }
      
      const cleanedText = this.cleanExtractedText(fullText);
      const processingTime = Date.now() - startTime;
      const medicalValidation = this.validateMedicalContent(cleanedText);
      
      console.log(`OCR extraction complete: ${cleanedText.length} characters in ${processingTime}ms`);
      
      return {
        success: true,
        text: cleanedText,
        metadata: {
          pageCount,
          fileSize: file.size,
          fileName: file.name,
          extractionMethod: 'OCR (Tesseract.js)',
          processingTime,
          medicalValidation
        }
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('OCR extraction failed:', error);
      
      return {
        success: false,
        error: `OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          fileSize: file.size,
          fileName: file.name,
          extractionMethod: 'OCR (failed)',
          processingTime
        }
      };
    }
  }
  
  /**
   * Extract text from text files
   */
  async extractTextFromTextFile(file: File): Promise<DocumentProcessingResult> {
    try {
      const text = await file.text();
      
      return {
        success: true,
        text: this.cleanExtractedText(text),
        metadata: {
          fileSize: file.size,
          fileName: file.name,
          extractionMethod: 'Direct text extraction'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Text file processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          fileSize: file.size,
          fileName: file.name,
          extractionMethod: 'Direct text extraction (failed)'
        }
      };
    }
  }
  
  /**
   * Main processing function that handles different file types
   */
  async processFile(file: File): Promise<DocumentProcessingResult> {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File too large. Maximum size is 50MB.',
        metadata: {
          fileSize: file.size,
          fileName: file.name,
          extractionMethod: 'File size validation (failed)'
        }
      };
    }
    
    // Route to appropriate extraction method
    switch (fileExtension) {
      case 'pdf':
        return await this.extractTextFromPDF(file);
      
      case 'txt':
      case 'md':
      case 'rtf':
        return await this.extractTextFromTextFile(file);
      
      default:
        return {
          success: false,
          error: `Unsupported file type: ${fileExtension}. Supported types: PDF, TXT, MD, RTF`,
          metadata: {
            fileSize: file.size,
            fileName: file.name,
            extractionMethod: 'File type validation (failed)'
          }
        };
    }
  }
  
  /**
   * Clean and normalize extracted text
   */
  private cleanExtractedText(text: string): string {
    if (!text) return '';
    
    // Remove excessive whitespace while preserving line breaks
    text = text.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs to single space
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n'); // Multiple line breaks to double
    
    // Fix common PDF extraction issues
    text = text.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space between camelCase
    text = text.replace(/(\d+)([A-Za-z])/g, '$1 $2'); // Add space between numbers and letters
    text = text.replace(/([A-Za-z])(\d+)/g, '$1 $2'); // Add space between letters and numbers
    
    // Remove page headers/footers patterns (basic)
    const lines = text.split('\n');
    const cleanedLines = lines.filter(line => {
      const trimmed = line.trim();
      // Remove lines that are likely headers/footers
      if (trimmed.length < 3) return false;
      if (/^Page \d+/.test(trimmed)) return false;
      if (/^\d+$/.test(trimmed)) return false; // Standalone page numbers
      return true;
    });
    
    return cleanedLines.join('\n').trim();
  }
  
  /**
   * Universal medical content validation with comprehensive keyword detection
   */
  validateMedicalContent(text: string): { isValid: boolean; confidence: number; reason?: string } {
    if (!text || text.length < 20) {
      return { 
        isValid: false, 
        confidence: 0, 
        reason: 'Text too short to determine medical content' 
      };
    }

    const textLower = text.toLowerCase();
    
    // Comprehensive medical keywords with weights
    const medicalKeywords = {
      // High-value medical terms (weight: 4)
      primary: [
        'patient', 'pt', 'diagnosis', 'medical record', 'hospital', 'physician', 'doctor',
        'treatment', 'medication', 'prescription', 'vital signs', 'blood pressure',
        'heart rate', 'temperature', 'allergies', 'surgery', 'procedure', 'chart',
        'medical', 'clinical', 'nurse', 'practitioner', 'provider', 'clinic'
      ],
      
      // Medium-value medical terms (weight: 3)
      secondary: [
        'health', 'therapeutic', 'dosage', 'symptoms', 'condition', 
        'examination', 'assessment', 'plan', 'history', 'complaint', 'pain', 
        'fever', 'nausea', 'fatigue', 'therapy', 'lab', 'laboratory', 'test',
        'result', 'normal', 'abnormal', 'chronic', 'acute', 'stable', 'improved'
      ],
      
      // Medical context terms (weight: 2)
      tertiary: [
        'facility', 'unit', 'department', 'consultation', 'referral', 'follow-up',
        'discharge', 'admission', 'emergency', 'icu', 'ward', 'room', 'visit',
        'appointment', 'record', 'note', 'documentation', 'report', 'summary'
      ],
      
      // Medical specialties and roles (weight: 2)
      roles: [
        'cardiologist', 'neurologist', 'oncologist', 'radiologist', 'surgeon',
        'resident', 'attending', 'specialist', 'md', 'rn', 'np', 'pa'
      ],
      
      // Medical measurements and data (weight: 2)
      measurements: [
        'mg', 'ml', 'cc', 'mcg', 'kg', 'lbs', 'bpm', 'mmhg', 'celsius', 'fahrenheit',
        'o2', 'oxygen', 'sat', 'saturation', 'pulse', 'weight', 'height', 'bmi'
      ],
      
      // Common medical abbreviations (weight: 2)
      abbreviations: [
        'bp', 'hr', 'rr', 'temp', 'wt', 'ht', 'iv', 'po', 'bid', 'tid', 'qid',
        'prn', 'stat', 'npo', 'dnr', 'cpr', 'icu', 'er', 'or', 'post-op', 'pre-op'
      ],
      
      // Medical conditions and symptoms (weight: 2)
      conditions: [
        'diabetes', 'hypertension', 'infection', 'inflammation', 'fracture',
        'pneumonia', 'cancer', 'tumor', 'lesion', 'edema', 'stenosis', 'arrhythmia',
        'shortness', 'breath', 'chest', 'abdominal', 'headache', 'dizziness'
      ],

      // Cardiac-specific terms (weight: 3)
      cardiac: [
        'cardiac', 'cardiology', 'heart', 'ekg', 'ecg', 'echo', 'troponin',
        'stemi', 'nstemi', 'cabg', 'angioplasty', 'stent', 'arrhythmia',
        'hypertension', 'hypotension', 'chest pain', 'dyspnea', 'ejection fraction'
      ]
    };

    let score = 0;
    let foundTerms: string[] = [];
    
    // Count terms with their respective weights
    Object.entries(medicalKeywords).forEach(([category, keywords]) => {
      const weight = category === 'primary' ? 4 : 
                   category === 'secondary' || category === 'cardiac' ? 3 : 2;
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = textLower.match(regex);
        if (matches) {
          score += matches.length * weight;
          if (!foundTerms.includes(keyword)) {
            foundTerms.push(keyword);
          }
        }
      });
    });

    // Check for medical patterns (high value)
    const medicalPatterns = [
      { pattern: /\b\d{1,3}\/\d{1,3}\b/g, weight: 3, name: 'blood pressure' },
      { pattern: /\b\d+\s*bpm\b/gi, weight: 3, name: 'heart rate' },
      { pattern: /\b\d+\s*(mg|ml|mcg|cc)\b/gi, weight: 3, name: 'dosage' },
      { pattern: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, weight: 2, name: 'dates' },
      { pattern: /\bMRN\s*:?\s*\d+/gi, weight: 4, name: 'MRN' },
      { pattern: /\b[A-Z]\d{2}\.\d+\b/g, weight: 4, name: 'ICD codes' },
      { pattern: /\b\d{5}\b/g, weight: 2, name: 'CPT codes' },
      { pattern: /\b\d+\s*years?\s*old\b/gi, weight: 3, name: 'age' },
      { pattern: /\b\d{2,3}\/\d{2,3}\s*mmhg\b/gi, weight: 4, name: 'BP reading' },
      { pattern: /\b(name|patient name|pt name)\s*:?\s*[A-Za-z]+/gi, weight: 3, name: 'patient name' },
      { pattern: /\b(dob|date of birth)\s*:?\s*\d/gi, weight: 3, name: 'date of birth' }
    ];

    medicalPatterns.forEach(({ pattern, weight, name }) => {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * weight;
        if (!foundTerms.includes(name)) {
          foundTerms.push(name);
        }
      }
    });

    // Additional context clues
    const contextClues = [
      'patient name', 'date of birth', 'medical history', 'chief complaint',
      'physical exam', 'vital signs', 'lab values', 'imaging results',
      'treatment plan', 'medication list', 'allergy list', 'progress note',
      'discharge summary', 'operative report', 'pathology report', 'consultation note'
    ];

    contextClues.forEach(clue => {
      if (textLower.includes(clue)) {
        score += 5;
        if (!foundTerms.includes(clue)) {
          foundTerms.push(clue);
        }
      }
    });

    // Calculate confidence (normalize to 0-1 scale)
    const maxExpectedScore = 100;
    const confidence = Math.min(score / maxExpectedScore, 1);
    
    // Very inclusive threshold - accept almost anything with medical indicators
    const isValid = score >= 1 || foundTerms.length >= 1;

    console.log(`Medical validation - Score: ${score}, Found terms: ${foundTerms.length}, Confidence: ${confidence.toFixed(3)}`);
    console.log('Found medical indicators:', foundTerms.slice(0, 10));
    
    if (!isValid) {
      return {
        isValid: false,
        confidence,
        reason: `Minimal medical content detected. Score: ${score}, Terms: ${foundTerms.length}. Processing anyway with low confidence.`
      };
    }

    return {
      isValid: true,
      confidence,
      reason: `Medical content detected with ${foundTerms.length} indicators (score: ${score})`
    };
  }
  
  /**
   * Get diagnostic information about the file
   */
  async diagnoseFile(file: File): Promise<{
    fileName: string;
    fileSize: string;
    fileType: string;
    supportedType: boolean;
    sizeValid: boolean;
    recommendations: string[];
  }> {
    const fileName = file.name;
    const fileSize = this.formatFileSize(file.size);
    const fileType = file.type || 'Unknown';
    const extension = fileName.toLowerCase().split('.').pop() || 'unknown';
    
    const supportedTypes = ['pdf', 'txt', 'md', 'rtf'];
    const supportedType = supportedTypes.includes(extension);
    const sizeValid = file.size <= 50 * 1024 * 1024; // 50MB
    
    const recommendations: string[] = [];
    
    if (!supportedType) {
      recommendations.push(`Convert file to supported format: ${supportedTypes.join(', ')}`);
    }
    
    if (!sizeValid) {
      recommendations.push('Reduce file size to under 50MB');
    }
    
    if (extension === 'pdf' && file.size < 1000) {
      recommendations.push('PDF file seems very small - may be empty or corrupted');
    }
    
    if (supportedType && sizeValid) {
      recommendations.push('File appears compatible with the extraction system');
    }
    
    return {
      fileName,
      fileSize,
      fileType,
      supportedType,
      sizeValid,
      recommendations
    };
  }
  
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}