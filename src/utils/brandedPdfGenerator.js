import { jsPDF } from 'jspdf';
import vigeoLogo from '../assets/images/vigeo-health-logo.png';

export const generateApplicationPDF = async (application) => {
  try {
    const doc = new jsPDF();
    
    // Brand colors matching the healthcare theme
    const brandColors = {
      primary: [175, 45, 44], // Brand red from logo
      secondary: [20, 184, 166], // Teal accent
      dark: [30, 58, 79], // Healthcare blue/dark
      text: [51, 51, 51],
      lightGray: [248, 249, 250],
      mediumGray: [206, 212, 218],
      gray: [108, 117, 125]
    };

    // Helper function to format date
    const formatDate = (date) => {
      if (!date) return 'Not provided';
      if (date && date.toDate) {
        return new Date(date.toDate()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        });
      }
      return date;
    };

    // Helper function to mask SSN
    const maskSSN = (ssn) => {
      if (!ssn) return 'Not provided';
      return '***-**-' + ssn.slice(-4);
    };

    let y = 15;
    const lineHeight = 6;
    const sectionGap = 8;
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to check page break
    const checkPageBreak = (neededSpace = 30) => {
      if (y > 270 - neededSpace) {
        addPageFooter(doc.internal.getCurrentPageInfo().pageNumber);
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Helper function to add page footer
    const addPageFooter = (pageNum) => {
      doc.setDrawColor(...brandColors.secondary);
      doc.setLineWidth(0.5);
      doc.line(margin, 280, pageWidth - margin, 280);
      
      doc.setFontSize(8);
      doc.setTextColor(...brandColors.gray);
      doc.text('VIGEO Health - Confidential Application Document', margin, 285);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 10, 285);
      const dateText = `Generated: ${new Date().toLocaleDateString()}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, (pageWidth - dateWidth) / 2, 285);
    };

    // Helper function to add section header with brand styling
    const addSectionHeader = (title) => {
      checkPageBreak(20);
      
      // Section background
      doc.setFillColor(...brandColors.lightGray);
      doc.rect(margin - 2, y - 2, contentWidth + 4, 10, 'F');
      
      // Section border accent
      doc.setDrawColor(...brandColors.secondary);
      doc.setLineWidth(2);
      doc.line(margin - 2, y - 2, margin - 2, y + 8);
      
      doc.setFontSize(12);
      doc.setTextColor(...brandColors.dark);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 2, y + 4);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandColors.text);
    };

    // Helper function to add field with better formatting
    const addField = (label, value, indent = 0) => {
      checkPageBreak();
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColors.gray);
      doc.text(label + ':', margin + indent, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandColors.text);
      
      const labelWidth = doc.getTextWidth(label + ': ');
      const valueText = value || 'Not provided';
      const maxWidth = contentWidth - indent - labelWidth - 5;
      
      // Handle long text with wrapping
      const lines = doc.splitTextToSize(valueText, maxWidth);
      doc.text(lines[0], margin + indent + labelWidth + 2, y);
      
      if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          y += lineHeight;
          checkPageBreak();
          doc.text(lines[i], margin + indent + labelWidth + 2, y);
        }
      }
      
      y += lineHeight;
    };

    // HEADER WITH LOGO
    try {
      // Try to add logo
      const imgData = await fetch(vigeoLogo).then(res => res.blob()).then(blob => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
      
      if (imgData) {
        doc.addImage(imgData, 'PNG', margin, y, 45, 18);
      }
    } catch (error) {
      console.log('Could not add logo, continuing without it');
    }
    
    // Title next to logo
    doc.setFontSize(28);
    doc.setTextColor(...brandColors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('VIGEO Health', 75, y + 8);
    
    doc.setFontSize(18);
    doc.setTextColor(...brandColors.secondary);
    doc.setFont('helvetica', 'normal');
    doc.text('Careers', 75, y + 16);
    
    y += 25;

    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(...brandColors.dark);
    doc.setFont('helvetica', 'normal');
    doc.text('Employment Application', margin, y);
    
    y += 5;

    // Header line with gradient effect
    doc.setDrawColor(...brandColors.primary);
    doc.setLineWidth(2);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setDrawColor(...brandColors.secondary);
    doc.setLineWidth(1);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);

    y += 10;

    // Application metadata box
    doc.setFillColor(...brandColors.lightGray);
    doc.roundedRect(margin, y - 3, contentWidth, 12, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(...brandColors.gray);
    doc.text(`Application ID: ${application.id.substring(0, 8).toUpperCase()}`, margin + 3, y + 2);
    
    const statusText = (application.status || 'draft').replace('_', ' ').toUpperCase();
    const statusColor = application.status === 'new' || application.status === 'submitted' ? brandColors.secondary : brandColors.gray;
    doc.setTextColor(...statusColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`Status: ${statusText}`, 85, y + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...brandColors.gray);
    doc.text(`Date: ${formatDate(application.submittedAt || application.createdAt)}`, 145, y + 2);
    
    y += 18;

    // POSITION SECTION
    addSectionHeader('Position Details');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColors.dark);
    doc.text(application.jobTitle || 'Position not specified', margin, y);
    y += sectionGap + 2;

    // PERSONAL INFORMATION SECTION  
    addSectionHeader('Personal Information');
    
    const fullName = `${application.personal?.firstName || ''} ${application.personal?.middleName || ''} ${application.personal?.lastName || ''}`.trim();
    
    // Create two-column layout for personal info
    const col1X = margin;
    const col2X = margin + contentWidth / 2 + 5;
    const originalY = y;
    
    // Column 1
    addField('Full Name', fullName || 'Not provided');
    addField('Email', application.personal?.email);
    addField('Phone', application.personal?.phone);
    addField('SSN', maskSSN(application.personal?.ssn));
    
    // Column 2
    const col1EndY = y;
    y = originalY;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColors.gray);
    doc.text('Date of Birth:', col2X, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...brandColors.text);
    doc.text(application.personal?.dateOfBirth || 'Not provided', col2X + doc.getTextWidth('Date of Birth: ') + 2, y);
    y += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColors.gray);
    doc.text('Available Date:', col2X, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...brandColors.text);
    doc.text(application.personal?.dateAvailable || 'Not provided', col2X + doc.getTextWidth('Available Date: ') + 2, y);
    y += lineHeight;
    
    // Driver's License
    if (application.personal?.driversLicense?.number) {
      const dl = application.personal.driversLicense;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColors.gray);
      doc.text("License #:", col2X, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandColors.text);
      doc.text(`${dl.number} (${dl.state})`, col2X + doc.getTextWidth("License #: ") + 2, y);
      y += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColors.gray);
      doc.text("Expires:", col2X, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandColors.text);
      doc.text(dl.expirationDate || 'N/A', col2X + doc.getTextWidth("Expires: ") + 2, y);
    }
    
    y = Math.max(y, col1EndY) + 3;
    
    // Address on full width
    if (application.personal?.address) {
      const addr = application.personal.address;
      const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim();
      addField('Address', fullAddress);
    }
    
    y += sectionGap;

    // EMERGENCY CONTACTS SECTION
    addSectionHeader('Emergency Contacts');
    
    if (application.emergency?.primary?.name) {
      doc.setFillColor(...brandColors.lightGray);
      doc.rect(margin, y - 2, contentWidth, 6, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColors.dark);
      doc.text('Primary Contact', margin + 2, y + 2);
      y += 8;
      
      addField('Name', application.emergency.primary.name, 5);
      addField('Relationship', application.emergency.primary.relationship, 5);
      addField('Phone', application.emergency.primary.phone, 5);
      
      if (application.emergency.primary.address) {
        const addr = application.emergency.primary.address;
        const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim();
        addField('Address', fullAddress, 5);
      }
      y += 3;
    }
    
    if (application.emergency?.secondary?.name) {
      doc.setFillColor(...brandColors.lightGray);
      doc.rect(margin, y - 2, contentWidth, 6, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColors.dark);
      doc.text('Secondary Contact', margin + 2, y + 2);
      y += 8;
      
      addField('Name', application.emergency.secondary.name, 5);
      addField('Relationship', application.emergency.secondary.relationship, 5);
      addField('Phone', application.emergency.secondary.phone, 5);
      y += 3;
    }
    
    if (!application.emergency?.primary?.name) {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No emergency contacts provided', margin, y);
      y += lineHeight;
    }
    
    y += sectionGap;

    // EDUCATION SECTION
    addSectionHeader('Education');
    
    if (application.education?.length > 0) {
      application.education.forEach((edu, index) => {
        checkPageBreak(30);
        
        // Education item header
        doc.setFillColor(...brandColors.lightGray);
        doc.rect(margin, y - 2, contentWidth, 6, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandColors.dark);
        doc.text(`Education ${index + 1}`, margin + 2, y + 2);
        y += 8;
        
        addField('Degree', edu.degree || edu.highestDegree, 5);
        addField('Field of Study', edu.fieldOfStudy, 5);
        addField('Institution', edu.schoolName || edu.institutionName, 5);
        addField('Graduation', edu.graduationDate, 5);
        y += 3;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No education information provided', margin, y);
      y += lineHeight;
    }
    
    y += sectionGap;

    // LICENSES & CERTIFICATIONS SECTION
    addSectionHeader('Professional Licenses & Certifications');
    
    if (application.licenses?.length > 0) {
      application.licenses.forEach((lic, index) => {
        checkPageBreak(25);
        
        doc.setFillColor(...brandColors.lightGray);
        doc.rect(margin, y - 2, contentWidth, 6, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandColors.dark);
        doc.text(`License/Certification ${index + 1}`, margin + 2, y + 2);
        y += 8;
        
        addField('Name', lic.name, 5);
        addField('Authority', lic.issuingAuthority, 5);
        addField('Number', lic.number, 5);
        addField('Expires', lic.expirationDate, 5);
        y += 3;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No licenses or certifications provided', margin, y);
      y += lineHeight;
    }
    
    y += sectionGap;

    // EMPLOYMENT HISTORY SECTION
    addSectionHeader('Employment History');
    
    if (application.employment?.length > 0) {
      application.employment.forEach((emp, index) => {
        checkPageBreak(30);
        
        doc.setFillColor(...brandColors.lightGray);
        doc.rect(margin, y - 2, contentWidth, 6, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandColors.dark);
        doc.text(`Position ${index + 1}`, margin + 2, y + 2);
        y += 8;
        
        addField('Title', emp.positionTitle, 5);
        addField('Employer', emp.employerName, 5);
        addField('Duration', `${emp.startDate || 'N/A'} to ${emp.currentEmployment ? 'Present' : emp.endDate || 'N/A'}`, 5);
        addField('Contact', emp.phone, 5);
        if (emp.address) {
          addField('Location', `${emp.address.city || 'N/A'}, ${emp.address.state || 'N/A'}`, 5);
        }
        y += 3;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No employment history provided', margin, y);
      y += lineHeight;
    }
    
    y += sectionGap;

    // DOCUMENTS SECTION
    addSectionHeader('Supporting Documents');
    
    if (application.documents?.length > 0) {
      // Create a simple table-like structure for documents
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColors.gray);
      
      // Table headers
      doc.text('Document Name', margin, y);
      doc.text('Type', margin + 60, y);
      doc.text('Size', margin + 110, y);
      doc.text('Status', margin + 140, y);
      
      y += 2;
      doc.setDrawColor(...brandColors.mediumGray);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandColors.text);
      
      application.documents.forEach((docItem) => {
        checkPageBreak(10);
        doc.setFontSize(9);
        
        const name = doc.splitTextToSize(docItem.displayName || docItem.name || 'Unnamed', 55);
        doc.text(name[0], margin, y);
        
        const docType = docItem.documentType ? docItem.documentType.replace('_', ' ') : 'Document';
        doc.text(docType, margin + 60, y);
        
        doc.text(`${((docItem.size || 0) / 1024).toFixed(1)} KB`, margin + 110, y);
        
        const statusColor = docItem.fileData ? brandColors.secondary : brandColors.gray;
        doc.setTextColor(...statusColor);
        doc.text(docItem.fileData ? 'Uploaded' : 'Pending', margin + 140, y);
        doc.setTextColor(...brandColors.text);
        
        y += 6;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No documents uploaded', margin, y);
    }

    // Add footer to last page
    addPageFooter(doc.internal.getNumberOfPages());

    // Save the PDF
    const lastName = (application.personal?.lastName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '');
    const firstName = (application.personal?.firstName || '').replace(/[^a-zA-Z0-9]/g, '');
    const shortId = application.id.substring(0, 8).toUpperCase();
    const fileName = `VIGEO_Health_Application_${firstName}${lastName}_${shortId}.pdf`;
    
    doc.save(fileName);
    
    console.log('Branded PDF generated successfully:', fileName);
    return true;
    
  } catch (error) {
    console.error('Error in branded PDF generation:', error);
    throw error;
  }
};