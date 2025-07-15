import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface DocumentProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  documentType?: 'medical_content' | 'table_of_contents' | 'unknown';
  tableOfContents?: string[];
  recommendation?: string;
  metadata?: {
    pageCount?: number;
    fileSize: number;
    fileName: string;
    extractionMethod: string;
    documentStructure?: string[];
  };
}

export class DocumentProcessor {
  /**
   * Extract text from PDF using PDF.js
   */
  async extractTextFromPDF(file: File): Promise<DocumentProcessingResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const pageCount = pdf.numPages;
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Combine text items into readable text
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n\n';
        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
        }
      }
      
      if (!fullText.trim()) {
        return {
          success: false,
          error: 'No readable text found in PDF. Document may be image-based or corrupted.',
          metadata: {
            pageCount,
            fileSize: file.size,
            fileName: file.name,
            extractionMethod: 'PDF.js'
          }
        };
      }
      
      return {
        success: true,
        text: this.cleanExtractedText(fullText),
        metadata: {
          pageCount,
          fileSize: file.size,
          fileName: file.name,
          extractionMethod: 'PDF.js'
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          fileSize: file.size,
          fileName: file.name,
          extractionMethod: 'PDF.js (failed)'
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
    let result: DocumentProcessingResult;
    switch (fileExtension) {
      case 'pdf':
        result = await this.extractTextFromPDF(file);
        break;
      
      case 'txt':
      case 'md':
      case 'rtf':
        result = await this.extractTextFromTextFile(file);
        break;
      
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
    
    // If extraction was successful, analyze document type
    if (result.success && result.text) {
      const documentAnalysis = this.analyzeDocumentType(result.text);
      result.documentType = documentAnalysis.type;
      
      if (documentAnalysis.type === 'table_of_contents') {
        result.tableOfContents = documentAnalysis.sections;
        result.recommendation = 'Document appears to be a table of contents, but will attempt to extract any available medical information.';
        
        if (result.metadata) {
          result.metadata.documentStructure = documentAnalysis.sections;
        }
        
        // Still mark as successful but with a warning - let the medical extractor decide
        console.log('TOC detected but proceeding with extraction attempt');
      }
    }
    
    return result;
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
   * Analyze document type to determine if it's table of contents or medical content
   */
  private analyzeDocumentType(text: string): { 
    type: 'medical_content' | 'table_of_contents' | 'unknown'; 
    sections?: string[];
    confidence: number;
  } {
    const tocIndicators = [
      'table of contents', 'page #', 'total # pages', 'medical record sections',
      'profile (', 'pages)', 'medication administration record', 'page 1 of',
      'run on:', 'page 2 of', 'page 3 of', 'printed on', 'run date'
    ];
    
    const contentIndicators = [
      'history of present illness', 'physical examination', 'assessment and plan',
      'vital signs:', 'blood pressure:', 'patient presents', 'chief complaint',
      'diagnosis:', 'medications:', 'patient is a', 'reviewed the', 'on examination',
      'patient reports', 'physical exam', 'current medications', 'past medical history'
    ];
    
    const textLower = text.toLowerCase();
    
    let tocCount = 0;
    let contentCount = 0;
    const foundSections: string[] = [];
    
    // Count table of contents indicators
    tocIndicators.forEach(indicator => {
      if (textLower.includes(indicator)) {
        tocCount++;
      }
    });
    
    // Count medical content indicators
    contentIndicators.forEach(indicator => {
      if (textLower.includes(indicator)) {
        contentCount++;
      }
    });
    
    // Extract potential sections for table of contents
    if (tocCount > 0) {
      const lines = text.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.includes('(') && trimmed.includes('pages)') || 
            trimmed.includes('page #') || 
            /page \d+ of \d+/i.test(trimmed)) {
          foundSections.push(trimmed);
        }
      });
    }
    
    console.log(`Document analysis: TOC indicators: ${tocCount}, Content indicators: ${contentCount}`);
    
    if (tocCount > contentCount && tocCount >= 3) {
      return {
        type: 'table_of_contents',
        sections: foundSections,
        confidence: Math.min(0.9, tocCount / 10)
      };
    } else if (contentCount >= 3) {
      return {
        type: 'medical_content',
        confidence: Math.min(0.9, contentCount / 10)
      };
    } else {
      return {
        type: 'unknown',
        confidence: 0.1
      };
    }
  }

  /**
   * Validate if text appears to be medical content
   */
  validateMedicalContent(text: string): { isValid: boolean; confidence: number; reason?: string } {
    const medicalKeywords = [
      'patient', 'diagnosis', 'medication', 'treatment', 'doctor', 'physician', 
      'nurse', 'hospital', 'clinic', 'medical', 'health', 'symptoms', 'condition',
      'therapy', 'procedure', 'examination', 'lab', 'test', 'vital signs',
      'blood pressure', 'heart rate', 'temperature', 'allergies', 'history'
    ];
    
    const cardiacKeywords = [
      'cardiac', 'cardiology', 'heart', 'ekg', 'ecg', 'echo', 'troponin',
      'stemi', 'nstemi', 'cabg', 'angioplasty', 'stent', 'arrhythmia',
      'hypertension', 'hypotension', 'chest pain', 'dyspnea', 'ejection fraction'
    ];
    
    const textLower = text.toLowerCase();
    
    let medicalScore = 0;
    let cardiacScore = 0;
    
    // Count medical keywords
    medicalKeywords.forEach(keyword => {
      const matches = (textLower.match(new RegExp(keyword, 'g')) || []).length;
      medicalScore += matches;
    });
    
    // Count cardiac-specific keywords
    cardiacKeywords.forEach(keyword => {
      const matches = (textLower.match(new RegExp(keyword, 'g')) || []).length;
      cardiacScore += matches * 2; // Weight cardiac keywords higher
    });
    
    const totalScore = medicalScore + cardiacScore;
    const textLength = text.length;
    
    // Calculate confidence based on keyword density
    const density = totalScore / (textLength / 1000); // Keywords per 1000 characters
    
    if (totalScore < 3) {
      return {
        isValid: false,
        confidence: 0,
        reason: 'Document does not appear to contain medical information'
      };
    }
    
    if (cardiacScore > 0) {
      return {
        isValid: true,
        confidence: Math.min(0.9, 0.6 + (cardiacScore / 20)),
        reason: 'Document contains cardiac/cardiology content'
      };
    }
    
    if (medicalScore >= 5) {
      return {
        isValid: true,
        confidence: Math.min(0.8, 0.4 + (medicalScore / 30)),
        reason: 'Document contains general medical content'
      };
    }
    
    return {
      isValid: true,
      confidence: Math.min(0.6, 0.2 + (totalScore / 50)),
      reason: 'Document contains some medical terminology'
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