import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateApplicationPDF = async (application) => {
  try {
    const doc = new jsPDF();
    
    // Brand colors
    const brandColors = {
      primary: [30, 58, 79], // Healthcare blue/dark
      secondary: [20, 184, 166], // Teal
      accent: [59, 130, 246], // Blue
      text: [51, 51, 51],
      lightGray: [243, 244, 246],
      gray: [156, 163, 175]
    };

    // Helper function to format date
    const formatDate = (date) => {
      if (!date) return 'Not provided';
      if (date.toDate) {
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

    let yPosition = 20;

    // Header text (without logo for now)
    doc.setFontSize(24);
    doc.setTextColor(...brandColors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('VIGEO Health', 15, yPosition);
    
    doc.setFontSize(20);
    doc.setTextColor(...brandColors.secondary);
    doc.text('Careers', 15, yPosition + 10);
    
    doc.setFontSize(14);
    doc.setTextColor(...brandColors.text);
    doc.setFont('helvetica', 'normal');
    doc.text('Application Summary', 15, yPosition + 20);

    // Draw header line
    doc.setDrawColor(...brandColors.secondary);
    doc.setLineWidth(1);
    doc.line(15, yPosition + 25, 195, yPosition + 25);

    yPosition = 55;

    // Application metadata
    doc.setFontSize(10);
    doc.setTextColor(...brandColors.gray);
    doc.text(`Application ID: ${application.id.substring(0, 8)}...`, 15, yPosition);
    doc.text(`Status: ${(application.status || 'draft').replace('_', ' ').toUpperCase()}`, 90, yPosition);
    doc.text(`Date: ${formatDate(application.submittedAt || application.createdAt)}`, 140, yPosition);
    
    yPosition += 10;

    // Job Information Section
    doc.setFillColor(...brandColors.lightGray);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(...brandColors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Position Applied For', 17, yPosition + 5.5);
    yPosition += 12;
    
    doc.setFontSize(11);
    doc.setTextColor(...brandColors.text);
    doc.setFont('helvetica', 'normal');
    doc.text(application.jobTitle || 'Position not specified', 17, yPosition);
    yPosition += 10;

    // Personal Information Section
    doc.setFillColor(...brandColors.lightGray);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(...brandColors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Personal Information', 17, yPosition + 5.5);
    yPosition += 12;

    const personalInfo = [
      ['Full Name', `${application.personal?.firstName || ''} ${application.personal?.middleName || ''} ${application.personal?.lastName || ''}`.trim() || 'Not provided'],
      ['Email', application.personal?.email || 'Not provided'],
      ['Phone', application.personal?.phone || 'Not provided'],
      ['Date of Birth', application.personal?.dateOfBirth || 'Not provided'],
      ['SSN', maskSSN(application.personal?.ssn)],
      ['Available Start Date', application.personal?.dateAvailable || 'Not provided']
    ];

    doc.autoTable({
      startY: yPosition,
      head: [],
      body: personalInfo,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 2,
        textColor: brandColors.text
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, textColor: brandColors.gray },
        1: { cellWidth: 135 }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 5;

    // Address
    if (application.personal?.address) {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.setFont('helvetica', 'bold');
      doc.text('Address:', 17, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandColors.text);
      const address = application.personal.address;
      doc.text(
        `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}`.trim(),
        62, yPosition
      );
      yPosition += 7;
    }

    // Driver's License
    if (application.personal?.driversLicense?.number) {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.setFont('helvetica', 'bold');
      doc.text("Driver's License:", 17, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandColors.text);
      const dl = application.personal.driversLicense;
      doc.text(
        `${dl.number || ''} (${dl.state || ''}) - Expires: ${dl.expirationDate || 'N/A'}`,
        62, yPosition
      );
      yPosition += 10;
    }

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Emergency Contacts Section
    doc.setFillColor(...brandColors.lightGray);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(...brandColors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Emergency Contacts', 17, yPosition + 5.5);
    yPosition += 12;

    if (application.emergency?.primary?.name) {
      const primaryContact = [
        ['Primary Contact', application.emergency.primary.name || 'Not provided'],
        ['Relationship', application.emergency.primary.relationship || 'Not provided'],
        ['Phone', application.emergency.primary.phone || 'Not provided']
      ];

      doc.autoTable({
        startY: yPosition,
        head: [],
        body: primaryContact,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: brandColors.text
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45, textColor: brandColors.gray },
          1: { cellWidth: 135 }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 5;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No emergency contacts provided', 17, yPosition);
      yPosition += 7;
    }

    // Check if we need a new page
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    // Education Section
    doc.setFillColor(...brandColors.lightGray);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(...brandColors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Education', 17, yPosition + 5.5);
    yPosition += 12;

    if (application.education?.length > 0) {
      application.education.forEach((edu, index) => {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(...brandColors.gray);
        doc.setFont('helvetica', 'bold');
        doc.text(`School ${index + 1}:`, 17, yPosition);
        yPosition += 5;
        
        const eduData = [
          ['Degree', edu.degree || edu.highestDegree || 'Not specified'],
          ['Field of Study', edu.fieldOfStudy || 'Not specified'],
          ['Institution', edu.schoolName || edu.institutionName || 'Not specified'],
          ['Graduation Date', edu.graduationDate || 'Not specified']
        ];

        doc.autoTable({
          startY: yPosition,
          head: [],
          body: eduData,
          theme: 'plain',
          styles: {
            fontSize: 9,
            cellPadding: 1,
            textColor: brandColors.text
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40, textColor: brandColors.gray },
            1: { cellWidth: 140 }
          }
        });
        
        yPosition = doc.lastAutoTable.finalY + 5;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No education information provided', 17, yPosition);
      yPosition += 7;
    }

    // Check if we need a new page
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    // Employment History Section
    doc.setFillColor(...brandColors.lightGray);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(...brandColors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Employment History', 17, yPosition + 5.5);
    yPosition += 12;

    if (application.employment?.length > 0) {
      application.employment.forEach((emp, index) => {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(...brandColors.gray);
        doc.setFont('helvetica', 'bold');
        doc.text(`Position ${index + 1}:`, 17, yPosition);
        yPosition += 5;
        
        const empData = [
          ['Title', emp.positionTitle || 'Not specified'],
          ['Employer', emp.employerName || 'Not specified'],
          ['Duration', `${emp.startDate || 'N/A'} to ${emp.currentEmployment ? 'Present' : emp.endDate || 'N/A'}`],
          ['Phone', emp.phone || 'Not provided']
        ];

        doc.autoTable({
          startY: yPosition,
          head: [],
          body: empData,
          theme: 'plain',
          styles: {
            fontSize: 9,
            cellPadding: 1,
            textColor: brandColors.text
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40, textColor: brandColors.gray },
            1: { cellWidth: 140 }
          }
        });
        
        yPosition = doc.lastAutoTable.finalY + 5;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No employment history provided', 17, yPosition);
      yPosition += 7;
    }

    // Check if we need a new page
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    // Documents Section
    doc.setFillColor(...brandColors.lightGray);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(...brandColors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Supporting Documents', 17, yPosition + 5.5);
    yPosition += 12;

    if (application.documents?.length > 0) {
      const docData = application.documents.map(doc => [
        doc.displayName || doc.name || 'Unnamed',
        doc.documentType ? doc.documentType.replace('_', ' ').charAt(0).toUpperCase() + doc.documentType.slice(1).replace('_', ' ') : 'Document',
        `${((doc.size || 0) / 1024).toFixed(2)} KB`,
        doc.fileData ? 'Included' : 'Pending'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Document Name', 'Type', 'Size', 'Status']],
        body: docData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          textColor: brandColors.text
        },
        headStyles: {
          fillColor: brandColors.secondary,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...brandColors.gray);
      doc.text('No documents uploaded', 17, yPosition);
    }

    // Footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(...brandColors.secondary);
      doc.setLineWidth(0.5);
      doc.line(15, 280, 195, 280);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(...brandColors.gray);
      doc.text('VIGEO Health - Confidential Application Document', 15, 285);
      doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });
    }

    // Save the PDF
    const fileName = `VIGEO_Health_Application_${application.personal?.lastName || 'Unknown'}_${application.personal?.firstName || ''}_${application.id.substring(0, 8)}.pdf`;
    doc.save(fileName);
    
    console.log('PDF generated successfully:', fileName);
    return true;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw error;
  }
};