// English UI strings for the Armtrex website.
const dict = {
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.kyc': 'Request Access',
    'nav.contact': 'Contact Us',
    'nav.primary': 'Primary',
    'nav.toggle': 'Toggle navigation menu',
    'nav.footer': 'Footer',
    'skipToContent': 'Skip to main content',
    backToTop: 'Back to top',
    'brand.homeAria': 'Armtrex Ltd, home',
    'lang.label': 'Language',
    'lang.en': 'EN',
    'lang.ms': 'MS',
    'lang.enFull': 'English',
    'lang.msFull': 'Bahasa Melayu',

    'hero.region': 'Featured products',
    'hero.featured': 'Featured',
    'hero.viewProducts': 'View Products',
    'hero.contactUs': 'Contact Us',
    'hero.prev': 'Previous slide',
    'hero.next': 'Next slide',
    'hero.controls': 'Carousel controls',
    'hero.goToSlide': 'Go to slide', // "Go to slide 1: <name>"

    'cred.registration': 'Company Registration',
    'cred.exportStatus': 'Export Status',
    'cred.exportStatusValue': 'Defence-Controlled · Authorized Buyers Only',
    'cred.certification': 'Certification',
    'cred.aria': 'Company credentials',

    'brief.kicker': 'Company Profile',
    'brief.heading': 'Who We Are',
    'brief.mission': 'Mission',
    'brief.vision': 'Vision',

    'cap.kicker': 'Core Business Activities',
    'cap.heading': 'Capabilities',
    'cap.cta':
      'Explore our portfolio of artillery and mortar ammunition, unguided rockets, and propellant charge systems.',
    'cap.viewAll': 'View All Products',

    'factory.kicker': 'Procurement & Supply Chain',
    'factory.heading': 'Inside the Supply Chain',
    'factory.lead':
      'From forging and precision machining through finishing, quality assurance, and export — an integrated artillery and ammunition supply chain sourced from vetted production partners.',
    'factory.line': 'Production Line',
    'factory.machining': 'Precision Machining',
    'factory.marking': 'Finishing & Marking',
    'factory.charge': 'Charge Systems',
    'factory.inspection': 'Energetic Materials',
    'factory.logistics': 'Logistics & Export',

    'compliance.kicker': 'Compliance & Quality Assurance',
    'compliance.heading': 'Responsible Defence Procurement',

    'loc.kicker': 'Locations',
    'loc.heading': 'Office',
    'loc.directContact': 'Direct Contact',
    'loc.telephone': 'Telephone',
    'loc.email': 'Email',
    'loc.website': 'Website',

    'footer.regNo': 'Company Reg. No.',
    'footer.navigation': 'Navigation',
    'footer.tel': 'Tel',
    'footer.email': 'Email',
    'footer.web': 'Web',
    'footer.rights': 'All rights reserved.',
    'footer.compliance':
      'defence-related and dual-use products supplied to governmental and authorized defence-sector customers in compliance with applicable UK and international regulations.',

    'products.kicker': 'Product Portfolio',
    'products.heading': 'Products',
    'products.lead':
      'Conventional ammunition systems, artillery and mortar munitions, unguided rockets, and propellant charge systems. All product descriptions are drawn directly from the manufacturer datasheets.',
    'products.all': 'All Products',
    'products.showing': 'Showing', // "Showing 26 products"
    'products.product': 'product',
    'products.products': 'products',
    'products.item': 'item',
    'products.items': 'items',
    'products.filterAria': 'Filter products by category',
    'view.label': 'View',
    'view.item': 'Item View',
    'view.table': 'Table View',
    'table.product': 'Product',
    'table.caliber': 'Caliber',
    'table.velocity': 'Muzzle velocity',
    'table.range': 'Max range',
    'table.view': 'View',

    'card.view': 'View', // "View <name>"
    'card.viewDetails': 'View details',
    'card.noDesc': 'No product description available in source content.',
    'card.noImage': 'No product image available',

    'detail.breadcrumb': 'Breadcrumb',
    'detail.specs': 'Technical Specifications',
    'detail.systems': 'Compatible Systems',
    'detail.back': 'Back to Products',
    'detail.enquire': 'Enquire About This Product',
    'detail.noDesc': 'No product description available in source content.',

    'contact.kicker': 'Get in Touch',
    'contact.heading': 'Contact Us',
    'contact.lead':
      'For governmental, military, and authorized defence-sector enquiries, please contact Armtrex using the details below.',
    'contact.directLines': 'Direct Lines',
    'contact.complianceLabel': 'Compliance',
    'contact.complianceNote': 'All correspondence with Armtrex Ltd will be stored for UK licence compliance regulations.',
    'contact.sendEnquiry': 'Send an Enquiry',
    'contact.regarding': 'Regarding',

    'form.name': 'Name',
    'form.email': 'Email',
    'form.company': 'Company',
    'form.subject': 'Subject',
    'form.message': 'Message',
    'form.send': 'Send Message',
    'form.sending': 'Sending…',
    'form.error': 'Please complete all required fields (Name, Email, Subject, and Message).',
    'form.fieldRequired': 'This field is required.',

    'gate.kicker': 'Restricted Access',
    'gate.heading': 'KYC & Security Clearance Required',
    'gate.lead':
      'Product specifications are only available to buyers and meeting attendees who have completed Know-Your-Customer (KYC), security, and end-use capacity screening. Submit a request below — our security team will follow up with a private, time-limited access link once clearance is confirmed.',
    'gate.checking': 'Checking your access link…',
    'gate.error': 'We couldn\u2019t verify that access link. It may have expired — request a new one below.',
    'gate.cta': 'Request Access (KYC Form)',
    'gate.home': 'Back to Home',
    'form.sentThanks':
      'Thank you — your enquiry has been sent. Our team will be in touch shortly.',
    'form.failed':
      'Sorry, your message could not be sent right now. Please email us directly at',
    'form.sent':
      'Your email client should now open with this enquiry ready to send. If it doesn’t, please email us directly at',
    'form.mailPrefix': '[Website Enquiry]',
    'form.bodyName': 'Name',
    'form.bodyEmail': 'Email',
    'form.bodyCompany': 'Company',
    'prefill.subject': 'Product Enquiry', // "Product Enquiry: <name>"
    'prefill.message': 'I would like to request further information about the', // "... the <name> (<category>)."
  },
}

export function useT() {
  return (key) => dict.en[key] ?? key
}
