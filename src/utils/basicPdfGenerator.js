import { jsPDF } from 'jspdf';

export const generateApplicationPDF = async (application) => {
  try {
    const doc = new jsPDF();
    
    // Brand colors (for text)
    const brandColors = {
      primary: [30, 58, 79], // Healthcare blue/dark
      secondary: [20, 184, 166], // Teal
      text: [51, 51, 51],
      gray: [156, 163, 175]
    };

    // Helper function to format date
    const formatDate = (date) => {
      if (!date) return 'Not provided';
      if (date && date.toDate) {
        return new Date(date.toDate()).toLocaleDateString('en-US');
      }
      return date;
    };

    // Helper function to mask SSN
    const maskSSN = (ssn) => {
      if (!ssn) return 'Not provided';
      return '***-**-' + ssn.slice(-4);
    };

    let y = 20;
    const lineHeight = 7;
    const sectionGap = 10;
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to check page break
    const checkPageBreak = (neededSpace = 30) => {
      if (y > 280 - neededSpace) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Helper function to add section header
    const addSectionHeader = (title) => {
      checkPageBreak(20);
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFontSize(12);
      doc.setTextColor(...brandColors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 2, y + 5.5);
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandColors.text);
    };

    // Helper function to add field
    const addField = (label, value, indent = 0) => {
      checkPageBreak();
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColors.gray);
      doc.text(label + ':', margin + indent, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandColors.text);
      const labelWidth = doc.getTextWidth(label + ': ');
      doc.text(value || 'Not provided', margin + indent + labelWidth + 2, y);
      y += lineHeight;
    };

    // HEADER
    doc.setFontSize(24);
    doc.setTextColor(...brandColors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('VIGEO Health', margin, y);
    
    doc.setFontSize(20);
    doc.setTextColor(...brandColors.secondary);
    doc.text('Careers', margin, y + 10);
    
    doc.setFontSize(14);
    doc.setTextColor(...brandColors.text);
    doc.setFont('helvetica', 'normal');
    doc.text('Application Summary', margin, y + 20);

    // Draw header line
    doc.setDrawColor(...brandColors.secondary);
    doc.setLineWidth(1);
    doc.line(margin, y + 25, pageWidth - margin, y + 25);

    y = 55;

    // Application metadata
    doc.setFontSize(9);
    doc.setTextColor(...brandColors.gray);
    doc.text(`Application ID: ${application.id.substring(0, 8)}...`, margin, y);
    doc.text(`Status: ${(application.status || 'draft').replace('_', ' ').toUpperCase()}`, 80, y);
    doc.text(`Date: ${formatDate(application.submittedAt || application.createdAt)}`, 140, y);
    
    y += sectionGap;

    // POSITION SECTION
    addSectionHeader('Position Applied For');
    doc.setFontSize(11);
    doc.text(application.jobTitle || 'Position not specified', margin, y);
    y += sectionGap;

    // PERSONAL INFORMATION SECTION
    addSectionHeader('Personal Information');
    
    const fullName = `${application.personal?.firstName || ''} ${application.personal?.middleName || ''} ${application.personal?.lastName || ''}`.trim();
    addField('Full Name', fullName || 'Not provided');
    addField('Email', application.personal?.email);
    addField('Phone', application.personal?.phone);
    addField('Date of Birth', application.personal?.dateOfBirth);
    addField('SSN', maskSSN(application.personal?.ssn));
    addField('Available Start Date', application.personal?.dateAvailable);
    
    if (application.personal?.address) {
      const addr = application.personal.address;
      const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim();
      addField('Address', fullAddress);
    }
    
    if (application.personal?.driversLicense?.number) {
      const dl = application.personal.driversLicense;
      addField("Driver's License", `${dl.number} (${dl.state}) - Expires: ${dl.expirationDate || 'N/A'}`);
    }
    
    y += sectionGap;

    // EMERGENCY CONTACTS SECTION
    addSectionHeader('Emergency Contacts');
    
    if (application.emergency?.primary?.name) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Primary Contact:', margin, y);
      y += lineHeight;
      addField('Name', application.emergency.primary.name, 10);
      addField('Relationship', application.emergency.primary.relationship, 10);
      addField('Phone', application.emergency.primary.phone, 10);
      
      if (application.emergency.primary.address) {
        const addr = application.emergency.primary.address;
        const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim();
        addField('Address', fullAddress, 10);
      }
      y += 5;
    }
    
    if (application.emergency?.secondary?.name) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Secondary Contact:', margin, y);
      y += lineHeight;
      addField('Name', application.emergency.secondary.name, 10);
      addField('Relationship', application.emergency.secondary.relationship, 10);
      addField('Phone', application.emergency.secondary.phone, 10);
      y += 5;
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
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandColors.primary);
        doc.text(`School ${index + 1}:`, margin, y);
        y += lineHeight;
        
        addField('Degree', edu.degree || edu.highestDegree, 10);
        addField('Field of Study', edu.fieldOfStudy, 10);
        addField('Institution', edu.schoolName || edu.institutionName, 10);
        addField('Graduation Date', edu.graduationDate, 10);
        y += 5;
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
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandColors.primary);
        doc.text(`License ${index + 1}:`, margin, y);
        y += lineHeight;
        
        addField('Name', lic.name, 10);
        addField('Issuing Authority', lic.issuingAuthority, 10);
        addField('Number', lic.number, 10);
        addField('Expiration', lic.expirationDate, 10);
        y += 5;
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
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandColors.primary);
        doc.text(`Position ${index + 1}:`, margin, y);
        y += lineHeight;
        
        addField('Title', emp.positionTitle, 10);
        addField('Employer', emp.employerName, 10);
        addField('Duration', `${emp.startDate || 'N/A'} to ${emp.currentEmployment ? 'Present' : emp.endDate || 'N/A'}`, 10);
        addField('Phone', emp.phone, 10);
        if (emp.address) {
          addField('Location', `${emp.address.city || 'N/A'}, ${emp.address.state || 'N/A'}`, 10);
        }
        y += 5;
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
      application.documents.forEach((docItem, index) => {
        checkPageBreak(20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandColors.primary);
        doc.text(`Document ${index + 1}:`, margin, y);
        y += lineHeight;
        
        addField('Name', docItem.displayName || docItem.name, 10);
        addField('Type', docItem.documentType ? docItem.documentType.replace('_', ' ') : 'Document', 10);
        addField('Size', `${((docItem.size || 0) / 1024).toFixed(2)} KB`, 10);
        addField('Status', docItem.fileData ? 'Uploaded' : 'Pending', 10);
        y += 5;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No documents uploaded', margin, y);
      y += lineHeight;
    }

    // FOOTER ON EACH PAGE
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(...brandColors.secondary);
      doc.setLineWidth(0.5);
      doc.line(margin, 280, pageWidth - margin, 280);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(...brandColors.gray);
      doc.text('VIGEO Health - Confidential Application Document', margin, 285);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 285);
      const dateText = `Generated: ${new Date().toLocaleDateString()}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, (pageWidth - dateWidth) / 2, 285);
    }

    // Save the PDF
    const lastName = application.personal?.lastName || 'Unknown';
    const firstName = application.personal?.firstName || '';
    const shortId = application.id.substring(0, 8);
    const fileName = `VIGEO_Health_Application_${lastName}_${firstName}_${shortId}.pdf`;
    
    doc.save(fileName);
    
    console.log('PDF generated successfully:', fileName);
    return true;
    
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw error;
  }
};