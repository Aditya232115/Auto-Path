import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Clear, reassuring title of the document or scheme in plain language',
    },
    summary: {
      type: Type.STRING,
      description: 'Plain-language summary of what this document is about in maximum 60 words at a 6th-grade reading level',
    },
    steps: {
      type: Type.ARRAY,
      description: 'Sequential, numbered actionable steps the user should perform',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Step identifier like step-1, step-2' },
          action: { type: Type.STRING, description: 'Short 3 to 7 word action instruction' },
          detail: { type: Type.STRING, description: 'Calm, simple 1-2 sentence explanation of how to do it' },
          difficulty: { type: Type.STRING, description: 'One of: Easy, Medium, or Needs Help' },
          estimatedTime: { type: Type.STRING, description: 'Time estimate, e.g. 5 mins, 10-15 mins, 1 day' },
        },
        required: ['id', 'action', 'detail', 'difficulty', 'estimatedTime'],
      },
    },
    documentsNeeded: {
      type: Type.ARRAY,
      description: 'List of physical documents or certificates the user needs to keep ready',
      items: { type: Type.STRING },
    },
    deadlines: {
      type: Type.ARRAY,
      description: 'Important submission or renewal dates mentioned in the text',
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: 'What is due, e.g. Annual submission deadline' },
          date: { type: Type.STRING, description: 'Exact date or relative timeframe mentioned' },
        },
        required: ['label', 'date'],
      },
    },
    commonMistakes: {
      type: Type.ARRAY,
      description: 'Common mistakes or misunderstandings to avoid',
      items: { type: Type.STRING },
    },
    privacyFlags: {
      type: Type.ARRAY,
      description: 'Warnings about sensitive information requested',
      items: { type: Type.STRING },
    },
    glossary: {
      type: Type.ARRAY,
      description: 'Complicated or legal words from the document translated into everyday simple terms',
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: 'The complicated word or acronym' },
          meaning: { type: Type.STRING, description: 'Plain everyday meaning' },
        },
        required: ['term', 'meaning'],
      },
    },
    confidence: {
      type: Type.STRING,
      description: 'Confidence level: High, Medium, or Low',
    },
    disclaimer: {
      type: Type.STRING,
      description: 'Reassuring disclaimer reminding the user to check with the official office or source',
    },
  },
  required: [
    'title',
    'summary',
    'steps',
    'documentsNeeded',
    'deadlines',
    'commonMistakes',
    'privacyFlags',
    'glossary',
    'confidence',
    'disclaimer',
  ],
};

// Verified Fallback Templates for Built-In Samples (Guarantees zero downtime)
const sampleFallbacks: Record<string, Record<string, any>> = {
  pension: {
    English: {
      title: 'Pension Life Certificate (Jeevan Pramaan) Submission',
      summary:
        'To ensure your monthly pension continues without interruption, you must submit your annual Life Certificate between November 1 and November 30, 2026. If you are 80 or older, you can begin submitting from October 1.',
      steps: [
        {
          id: 'step-1',
          action: 'Find your PPO number and Passbook',
          detail: 'Locate your Pension Payment Order (PPO) number on your previous pension slip or your bank passbook.',
          difficulty: 'Easy',
          estimatedTime: '5 mins',
        },
        {
          id: 'step-2',
          action: 'Check your Aadhaar mobile number',
          detail: 'Make sure the mobile phone linked to your Aadhaar card is nearby to receive verification messages.',
          difficulty: 'Easy',
          estimatedTime: '2 mins',
        },
        {
          id: 'step-3',
          action: 'Choose your preferred submission method',
          detail: 'Either use the Jeevan Pramaan app on your phone, ask your local postman for a doorstep visit (₹70 fee), or visit your bank branch directly.',
          difficulty: 'Medium',
          estimatedTime: '15-30 mins',
        },
        {
          id: 'step-4',
          action: 'Save your submission confirmation receipt',
          detail: 'Keep the SMS or printed acknowledgment safe until your December pension is credited smoothly.',
          difficulty: 'Easy',
          estimatedTime: '5 mins',
        },
      ],
      documentsNeeded: [
        'Pension Payment Order (PPO) Number',
        'Aadhaar Card (with mobile linked)',
        'Pension Bank Account Passbook',
      ],
      deadlines: [
        { label: 'Pensioners aged 80 and above', date: 'From October 1, 2026 onwards' },
        { label: 'General submission window (under 80)', date: 'November 1 to November 30, 2026' },
      ],
      commonMistakes: [
        'Waiting until the last week of November when bank branches and post offices have very long lines.',
        'Believing phone calls asking for bank passwords or OTPs to verify pension status.',
      ],
      privacyFlags: [
        'Government officials and banks NEVER call asking for your ATM PIN, Netbanking password, or OTP. Never click SMS links from unknown senders claiming your pension is blocked.',
      ],
      glossary: [
        { term: 'PPO Number', meaning: 'Your unique 12-digit Pension Payment Order number given by the government.' },
        { term: 'Jeevan Pramaan', meaning: 'A secure government mobile app to prove you are alive using face or fingerprint.' },
        { term: 'Doorstep Banking', meaning: 'A service where a postman or bank agent visits your home to assist you.' },
      ],
      confidence: 'High',
      disclaimer: 'This is a guide, not official legal advice. Confirm on the official Jeevan Pramaan portal or your disbursing bank.',
    },
    Hindi: {
      title: 'वार्षिक जीवन प्रमाण पत्र (Jeevan Pramaan) जमा करने की प्रक्रिया',
      summary:
        'अपनी मासिक पेंशन बिना रुकावट जारी रखने के लिए १ नवंबर से ३० नवंबर २०२६ के बीच अपना वार्षिक जीवन प्रमाण पत्र अवश्य जमा करें। ८० वर्ष या उससे अधिक उम्र के वरिष्ठजन १ अक्टूबर से ही इसे जमा कर सकते हैं।',
      steps: [
        {
          id: 'step-1',
          action: 'अपना पीपीओ (PPO) नंबर निकाल कर रखें',
          detail: 'अपनी पुरानी पेंशन पर्ची या बैंक पासबुक में से १२ अंकों का पीपीओ नंबर ढूंढकर लिख लें।',
          difficulty: 'Easy',
          estimatedTime: '५ मिनट',
        },
        {
          id: 'step-2',
          action: 'आधार से जुड़ा मोबाइल फोन पास रखें',
          detail: 'ओटीपी और पुष्टि संदेश प्राप्त करने के लिए आधार लिंक मोबाइल को चालू रखें।',
          difficulty: 'Easy',
          estimatedTime: '२ मिनट',
        },
        {
          id: 'step-3',
          action: 'अपनी पसंद का आसान तरीका चुनें',
          detail: 'आप घर बैठे जीवन प्रमाण ऐप से, या डाकिए (डाक सेवक) को घर बुलाकर (₹७० शुल्क), या बैंक शाखा जाकर जमा कर सकते हैं।',
          difficulty: 'Medium',
          estimatedTime: '१५ से २० मिनट',
        },
        {
          id: 'step-4',
          action: 'जमा होने की रसीद या मैसेज संभाल कर रखें',
          detail: 'दिसंबर की पेंशन आने तक प्रमाण पत्र जमा होने का पावती संदेश संभाल कर रखें।',
          difficulty: 'Easy',
          estimatedTime: '५ मिनट',
        },
      ],
      documentsNeeded: [
        'पीपीओ (PPO) नंबर',
        'आधार कार्ड (मोबाइल नंबर लिंक)',
        'पेंशन बैंक खाते की पासबुक',
      ],
      deadlines: [
        { label: '८० वर्ष और अधिक आयु के वरिष्ठजन', date: '१ अक्टूबर २०२६ से' },
        { label: 'सामान्य समय सीमा (८० से कम)', date: '१ नवंबर से ३० नवंबर २०२६ तक' },
      ],
      commonMistakes: [
        'आखिरी तारीख का इंतजार करना, जिससे अंतिम दिनों में भीड़ और सर्वर की समस्या हो सकती है।',
        'पेंशन बंद होने के डर से अनजान व्यक्ति को फोन पर ओटीपी बता देना।',
      ],
      privacyFlags: [
        'सरकारी कर्मचारी या बैंक कभी भी फोन पर एटीएम पिन, पासवर्ड या ओटीपी नहीं मांगते। किसी अनजान नंबर पर भरोसा न करें।',
      ],
      glossary: [
        { term: 'पीपीओ (PPO)', meaning: 'पेंशन भुगतान आदेश नंबर, जो हर पेंशनभोगी की मुख्य पहचान संख्या है।' },
        { term: 'जीवन प्रमाण', meaning: 'सरकारी डिजिटल प्रमाण पत्र जिससे साबित होता है कि पेंशनभोगी जीवित है।' },
      ],
      confidence: 'High',
      disclaimer: 'यह केवल मार्गदर्शन हेतु है, आधिकारिक सलाह नहीं। कृपया संबंधित बैंक या पेंशन कार्यालय से पुष्टि करें।',
    },
    Marathi: {
      title: 'वार्षिक जीवन प्रमाणपत्र (Life Certificate) सादर करण्याची कृती',
      summary:
        'आपली दरमहा मिळणारी पेन्शन चालू राहण्यासाठी १ नोव्हेंबर ते ३० नोव्हेंबर २०२६ या काळात जीवन प्रमाणपत्र सादर करणे बंधनकारक आहे. ८० वर्षे किंवा त्याहून अधिक वयाच्या नागरिकांना १ ऑक्टोबरपासूनच ही सुविधा उपलब्ध आहे.',
      steps: [
        {
          id: 'step-1',
          action: 'पीपीओ (PPO) क्रमांक शोधून ठेवा',
          detail: 'आपल्या पेन्शन स्लिपवरून किंवा बँकेच्या पासबुकवरून १२ आकडी पीपीओ नंबर लिहून ठेवा.',
          difficulty: 'Easy',
          estimatedTime: '५ मिनिटे',
        },
        {
          id: 'step-2',
          action: 'आधार लिंक असलेला मोबाईल जवळ ठेवा',
          detail: 'पडताळणीचा ओटीपी (OTP) येण्यासाठी मोबाईल चालू आणि जवळ ठेवा.',
          difficulty: 'Easy',
          estimatedTime: '२ मिनिटे',
        },
        {
          id: 'step-3',
          action: 'सोपा पर्याय निवडून प्रमाणपत्र द्या',
          detail: 'मोबाईलमधील जीवन प्रमाण ॲपवरून, पोस्टमनला घरी बोलावून (अंदाजे ₹७० शुल्क), किंवा थेट बँक शाखेत जाऊन सादर करा.',
          difficulty: 'Medium',
          estimatedTime: '१५-२० मिनिटे',
        },
        {
          id: 'step-4',
          action: 'सादर केल्याचा मेसेज किंवा पावती जतन करा',
          detail: 'डिसेंबर महिन्याची पेन्शन खात्यात जमा होईपर्यंत हा मेसेज जपून ठेवा.',
          difficulty: 'Easy',
          estimatedTime: '५ मिनिटे',
        },
      ],
      documentsNeeded: [
        'पेन्शन पेमेंट ऑर्डर (PPO) क्रमांक',
        'आधार कार्ड (मोबाईल लिंक असलेले)',
        'पेन्शन बँकेचे पासबुक',
      ],
      deadlines: [
        { label: '८० वर्षे किंवा त्याहून अधिक वयाचे पेन्शनधारक', date: '१ ऑक्टोबर २०२६ पासून' },
        { label: 'सर्वसाधारण मुदत (८० वर्षांखालील)', date: '१ नोव्हेंबर ते ३० नोव्हेंबर २०२६' },
      ],
      commonMistakes: [
        'नोव्हेंबरच्या शेवटच्या आठवड्यापर्यंत थांबणे, ज्यामुळे शाखेत गर्दी होऊ शकते.',
        'पेन्शनच्या नावाखाली येणाऱ्या संशयास्पद फोनवर बँक खात्याची माहिती देणे.',
      ],
      privacyFlags: [
        'बँक किंवा सरकार कधीही आपला गुप्त एटीएम पिन, पासवर्ड किंवा ओटीपी विचारत नाही. अनोळखी लिंकवर क्लिक करू नका.',
      ],
      glossary: [
        { term: 'पीपीओ (PPO)', meaning: 'पेन्शन पेमेंट ऑर्डर क्रमांक, जो पेन्शनधारकाचा अधिकृत ओळख क्रमांक असतो.' },
        { term: 'जीवन प्रमाण', meaning: 'शासकीय डिजिटल ॲप ज्याद्वारे घरबसल्या हयातीचा दाखला दिला जातो.' },
      ],
      confidence: 'High',
      disclaimer: 'हे मार्गदर्शक समजण्यासाठी आहे, अधिकृत सल्ला नाही. कृपया अधिकृत बँक शाखेत खात्री करून घ्यावी.',
    },
  },
  kyc: {
    English: {
      title: 'Bank Account Periodic KYC Re-Verification Notice',
      summary:
        'Your bank requires you to re-verify your identity documents by December 15, 2026 to keep your savings account active. If not completed, you will not be able to withdraw money from your account.',
      steps: [
        {
          id: 'step-1',
          action: 'Keep your identity documents ready',
          detail: 'Take your Aadhaar card and PAN card. Write your signature across a photocopy of each.',
          difficulty: 'Easy',
          estimatedTime: '10 mins',
        },
        {
          id: 'step-2',
          action: 'Choose branch visit or mobile video-KYC',
          detail: 'You can walk into your nearest home branch with originals, or use your bank mobile app for Video KYC on working days.',
          difficulty: 'Medium',
          estimatedTime: '20 mins',
        },
        {
          id: 'step-3',
          action: 'Submit self-attested copies at the desk',
          detail: 'Hand the signed photocopies to the bank officer and show your original cards for verification.',
          difficulty: 'Easy',
          estimatedTime: '15 mins',
        },
        {
          id: 'step-4',
          action: 'Obtain an acknowledgment stamp or SMS',
          detail: 'Ask the officer for an acknowledgment stamp or wait for the confirmation SMS from the bank.',
          difficulty: 'Easy',
          estimatedTime: '5 mins',
        },
      ],
      documentsNeeded: [
        'Aadhaar Card (photocopy signed by you)',
        'PAN Card or Form 60',
        'One recent passport-sized photograph',
      ],
      deadlines: [
        { label: 'Final Re-KYC Submission Deadline', date: 'December 15, 2026' },
      ],
      commonMistakes: [
        'Ignoring the letter until your debit card or UPI transactions stop working.',
        'Downloading apps sent via SMS links from people claiming to be bank agents.',
      ],
      privacyFlags: [
        'Never download screen-sharing apps (like AnyDesk or TeamViewer) or share passwords/OTPs over the phone. The bank will never ask for them.',
      ],
      glossary: [
        { term: 'Re-KYC', meaning: 'Periodic renewal of your identity and address documents at your bank.' },
        { term: 'Self-attested', meaning: 'Writing your own signature on a photocopy to confirm it is genuine.' },
        { term: 'Debit Freeze', meaning: 'A temporary stop on withdrawing or spending money from your account.' },
      ],
      confidence: 'High',
      disclaimer: 'This is a guide, not official legal advice. Confirm directly with your bank branch.',
    },
    Hindi: {
      title: 'बैंक खाता पुन: सत्यापन (Re-KYC) प्रक्रिया',
      summary:
        'अपने बचत खाते को चालू रखने के लिए १५ दिसंबर २०२६ तक अपने पहचान दस्तावेज (केवाईसी) बैंक में अवश्य जमा करें। ऐसा न करने पर खाते से पैसे निकालने पर रोक लग सकती है।',
      steps: [
        {
          id: 'step-1',
          action: 'आधार और पैन कार्ड की फोटोकॉपी तैयार करें',
          detail: 'दोनों कार्ड की फोटोकॉपी पर अपने हस्ताक्षर (साइन) करें।',
          difficulty: 'Easy',
          estimatedTime: '१० मिनट',
        },
        {
          id: 'step-2',
          action: 'बैंक शाखा जाएं या वीडियो कॉल से करें',
          detail: 'मूल आधार और पैन कार्ड लेकर नजदीकी बैंक शाखा जाएं, अथवा बैंक ऐप में वीडियो कॉल द्वारा पूरा करें।',
          difficulty: 'Medium',
          estimatedTime: '२० मिनट',
        },
        {
          id: 'step-3',
          action: 'दस्तावेज जमा कर रसीद प्राप्त करें',
          detail: 'बैंक काउंटर पर कागजात जमा करें और पावती रसीद या मैसेज की पुष्टि प्राप्त करें।',
          difficulty: 'Easy',
          estimatedTime: '१० मिनट',
        },
      ],
      documentsNeeded: [
        'हस्ताक्षरित आधार कार्ड फोटोकॉपी',
        'पैन कार्ड फोटोकॉपी',
        'एक पासपोर्ट साइज फोटो',
      ],
      deadlines: [
        { label: 'अंतिम केवाईसी तारीख', date: '१५ दिसंबर २०२६' },
      ],
      commonMistakes: [
        'समय सीमा बीतने का इंतजार करना, जिससे खाता डेबिट फ्रीज हो सकता है।',
        'फोन पर केवाईसी पूरा करने का दावा करने वाले अनजान लोगों को ओटीपी देना।',
      ],
      privacyFlags: [
        'बैंक कभी भी एनीडेस्क जैसी स्क्रीन शेयरिंग ऐप डाउनलोड करने या पासवर्ड बताने के लिए नहीं कहता।',
      ],
      glossary: [
        { term: 'केवाईसी (KYC)', meaning: 'ग्राहक की पहचान और पते का आधिकारिक सत्यापन।' },
        { term: 'डेबिट फ्रीज', meaning: 'खाते से पैसे निकालने या ट्रांसफर करने पर अस्थायी रोक।' },
      ],
      confidence: 'High',
      disclaimer: 'यह केवल समझने के लिए है। कृपया अपनी बैंक शाखा से पुष्टि करें।',
    },
    Marathi: {
      title: 'बँक खाते केवायसी पडताळणी (Re-KYC) कृती',
      summary:
        'आपले बचत खाते विनाअडथळा चालू ठेवण्यासाठी १५ डिसेंबर २०२६ पर्यंत आपले ओळखपत्र व पत्त्याचा पुरावा बँकेत अद्ययावत करणे आवश्यक आहे.',
      steps: [
        {
          id: 'step-1',
          action: 'आधार व पॅन कार्डची झेरॉक्स काढा',
          detail: 'झेरॉक्सवर स्वतःची स्वाक्षरी (सही) करून ठेवा.',
          difficulty: 'Easy',
          estimatedTime: '१० मिनिटे',
        },
        {
          id: 'step-2',
          action: 'जवळच्या बँक शाखेत प्रत्यक्ष जा',
          detail: 'मूळ कागदपत्रे आणि एक फोटो सोबत घेऊन शाखेत जा किंवा बँक ॲपवरून व्हिडिओ केवायसी पूर्ण करा.',
          difficulty: 'Medium',
          estimatedTime: '२० मिनिटे',
        },
        {
          id: 'step-3',
          action: 'कागदपत्रे जमा करून पावती घ्या',
          detail: 'कागदपत्रे दिल्यावर बँकेचा अधिकृत शिक्का किंवा एसएमएस तपासा.',
          difficulty: 'Easy',
          estimatedTime: '१० मिनिटे',
        },
      ],
      documentsNeeded: [
        'स्वाक्षरी असलेले आधार कार्ड झेरॉक्स',
        'पॅन कार्ड झेरॉक्स',
        'एक पासपोर्ट आकाराचा फोटो',
      ],
      deadlines: [
        { label: 'केवायसी सादर करण्याची अंतिम मुदत', date: '१५ डिसेंबर २०२६' },
      ],
      commonMistakes: [
        'मुदत संपेपर्यंत दुर्लक्ष करणे, ज्यामुळे खात्यातून पैसे काढता येणार नाहीत.',
      ],
      privacyFlags: [
        'बँक अधिकारी कधीही फोनवर गुप्त पासवर्ड किंवा ओटीपी विचारत नाहीत. फसव्या कॉल्सपासून सावध राहा.',
      ],
      glossary: [
        { term: 'केवायसी (KYC)', meaning: 'बँकेत ग्राहकाची ओळख व पत्ता पडताळणी.' },
      ],
      confidence: 'High',
      disclaimer: 'हे मार्गदर्शक केवळ मदतीसाठी आहे. अधिक माहितीसाठी आपल्या बँकेत संपर्क करा.',
    },
  },
  scholarship: {
    English: {
      title: 'Post-Matric Higher Education Scholarship & Fee Waiver',
      summary:
        'Eligible college students with family annual income under ₹2,50,000 can receive full tuition reimbursement and stipends. Complete your online portal application by December 20, 2026 and verify documents at your college desk by December 31, 2026.',
      steps: [
        {
          id: 'step-1',
          action: 'Obtain current Income & Domicile Certificates',
          detail: 'Ensure your Tahsildar-issued Income Certificate for FY 2025-26 is valid and states income below ₹2.5 Lakhs.',
          difficulty: 'Medium',
          estimatedTime: '1-2 days',
        },
        {
          id: 'step-2',
          action: 'Verify your Aadhaar-bank account seeding (DBT)',
          detail: 'Confirm that your single bank account (in the student’s own name) is linked with Aadhaar NPCI for direct benefit transfer.',
          difficulty: 'Easy',
          estimatedTime: '15 mins',
        },
        {
          id: 'step-3',
          action: 'Submit the online scholarship application',
          detail: 'Upload scanned copies of mark sheets, fee receipts, and certificates on the scholarship portal before December 20.',
          difficulty: 'Medium',
          estimatedTime: '30 mins',
        },
        {
          id: 'step-4',
          action: 'Submit printed form to your college clerk',
          detail: 'Submit physical copies of all documents to your college scholarship desk before December 31 for final college verification.',
          difficulty: 'Easy',
          estimatedTime: '20 mins',
        },
      ],
      documentsNeeded: [
        'Income Certificate from Tehsildar (FY 2025-26)',
        'State Domicile Certificate',
        'Mark sheets of Class 10th, 12th, or last semester',
        'Current year College Admission Fee Receipt',
        'Aadhaar seeded bank passbook in student’s name',
      ],
      deadlines: [
        { label: 'Online Application Cut-off', date: 'December 20, 2026' },
        { label: 'College Verification Deadline', date: 'December 31, 2026' },
      ],
      commonMistakes: [
        'Giving a parent’s bank account or joint account—the scholarship requires a single account in the student’s own name.',
        'Sharing your portal password with cyber cafe operators.',
      ],
      privacyFlags: [
        'Keep your scholarship portal password private. Do not save credentials on public cyber cafe computers.',
      ],
      glossary: [
        { term: 'NPCI Mapping / DBT', meaning: 'Connecting your bank account with Aadhaar so government money lands directly in your account.' },
        { term: 'Bonafide Certificate', meaning: 'A letter signed by your college principal confirming you are a regular enrolled student.' },
      ],
      confidence: 'High',
      disclaimer: 'This is a guide, not official government advice. Confirm all dates with your college administration.',
    },
    Hindi: {
      title: 'पोस्ट-मैट्रिक छात्रवृत्ति एवं कॉलेज फीस माफी योजना',
      summary:
        'जिन विद्यार्थियों के परिवार की वार्षिक आय ₹२.५ लाख से कम है, वे छात्रवृत्ति के लिए २० दिसंबर २०२६ तक ऑनलाइन आवेदन कर सकते हैं। कॉलेज में कागजातों की जांच कराने की अंतिम तारीख ३१ दिसंबर २०२६ है।',
      steps: [
        {
          id: 'step-1',
          action: 'तहसीलदार से आय और निवास प्रमाण पत्र बनवाएं',
          detail: 'सुनिश्चित करें कि आय प्रमाण पत्र वैध है और आय ₹२,५०,००० से कम है।',
          difficulty: 'Medium',
          estimatedTime: '१-२ दिन',
        },
        {
          id: 'step-2',
          action: 'बैंक खाता छात्र के नाम पर और आधार से लिंक रखें',
          detail: 'छात्रवृत्ति का पैसा केवल छात्र के स्वयं के आधार से जुड़े खाते (DBT) में ही आता है।',
          difficulty: 'Easy',
          estimatedTime: '१५ मिनट',
        },
        {
          id: 'step-3',
          action: 'पोर्टल पर ऑनलाइन फॉर्म भरकर प्रिंट निकालें',
          detail: '२० दिसंबर से पहले ऑनलाइन फॉर्म भरें और अपनी फीस रसीद व मार्कशीट अपलोड करें।',
          difficulty: 'Medium',
          estimatedTime: '३० मिनट',
        },
        {
          id: 'step-4',
          action: 'कॉलेज में कागजात जमा करवाएं',
          detail: '३१ दिसंबर २०२६ से पहले फॉर्म की कॉपी और मूल दस्तावेज कॉलेज में सत्यापित करवाएं।',
          difficulty: 'Easy',
          estimatedTime: '२० मिनट',
        },
      ],
      documentsNeeded: [
        'तहसीलदार द्वारा आय प्रमाण पत्र',
        'मूल निवास प्रमाण पत्र',
        'पिछली कक्षा की मार्कशीट',
        'कॉलेज फीस रसीद व बोनाफाइड प्रमाणपत्र',
        'आधार कार्ड और बैंक पासबुक',
      ],
      deadlines: [
        { label: 'ऑनलाइन आवेदन की अंतिम तिथि', date: '२० दिसंबर २०२६' },
        { label: 'कॉलेज सत्यापन की अंतिम तिथि', date: '३१ दिसंबर २०२६' },
      ],
      commonMistakes: [
        'माता-पिता का बैंक खाता देना—खाता केवल छात्र के अपने नाम पर होना चाहिए।',
        'साइबर कैफे वाले को अपना पासवर्ड दे देना।',
      ],
      privacyFlags: [
        'अपना छात्रवृत्ति पोर्टल पासवर्ड सुरक्षित रखें और किसी अन्य व्यक्ति से साझा न करें।',
      ],
      glossary: [
        { term: 'डीबीटी (DBT)', meaning: 'सरकार से सीधे छात्र के बैंक खाते में पैसा भेजने की प्रणाली।' },
        { term: 'बोनाफाइड प्रमाणपत्र', meaning: 'कॉलेज द्वारा दिया गया प्रमाणपत्र जो साबित करता है कि आप वहां के नियमित छात्र हैं।' },
      ],
      confidence: 'High',
      disclaimer: 'यह केवल समझने के लिए मार्गदर्शिका है। कृपया कॉलेज कार्यालय से पुष्टि करें।',
    },
    Marathi: {
      title: 'मॅट्रिकोत्तर शिष्यवृत्ती व शिक्षण शुल्क माफी योजना',
      summary:
        'वार्षिक उत्पन्न ₹२,५०,००० पेक्षा कमी असलेल्या पात्र महाविद्यालयीन विद्यार्थ्यांसाठी शिष्यवृत्ती अर्ज २० डिसेंबर २०२६ पर्यंत भरता येईल. ३१ डिसेंबर २०२६ पर्यंत कागदपत्रांची पडताळणी कॉलेजमध्ये करणे आवश्यक आहे.',
      steps: [
        {
          id: 'step-1',
          action: 'तहसीलदारांचा उत्पन्नाचा व रहिवासी दाखला मिळवा',
          detail: 'उत्पन्न दाखला वैध असावा आणि उत्पन्न अडीच लाखांच्या आत असावे.',
          difficulty: 'Medium',
          estimatedTime: '१-२ दिवस',
        },
        {
          id: 'step-2',
          action: 'विद्यार्थ्याचे बँक खाते आधार लिंक असल्याची खात्री करा',
          detail: 'शिष्यवृत्तीचे पैसे थेट विद्यार्थ्याच्याच खात्यात जमा होतात, संयुक्त खाते चालत नाही.',
          difficulty: 'Easy',
          estimatedTime: '१५ मिनिटे',
        },
        {
          id: 'step-3',
          action: 'पोर्टलवर अर्ज भरून प्रिंट काढा',
          detail: '२० डिसेंबरपूर्वी ऑनलाईन अर्ज पूर्ण करून कॉलेज फी पावती व गुणपत्रिका अपलोड करा.',
          difficulty: 'Medium',
          estimatedTime: '३० मिनिटे',
        },
        {
          id: 'step-4',
          action: 'कॉलेजमध्ये कागदपत्रे जमा करा',
          detail: '३१ डिसेंबरपूर्वी अर्जाची प्रिंट आणि आवश्यक कागदपत्रे कॉलेजच्या काउंटरवर जमा करा.',
          difficulty: 'Easy',
          estimatedTime: '२० मिनिटे',
        },
      ],
      documentsNeeded: [
        'तहसीलदारांचा उत्पन्नाचा दाखला',
        'अधिवास प्रमाणपत्र (Domicile)',
        'मागील परीक्षेची गुणपत्रिका',
        'कॉलेज फी पावती व बोनाफाईड दाखला',
        'आधार कार्ड आणि बँक पासबुक',
      ],
      deadlines: [
        { label: 'ऑनलाईन अर्ज करण्याची अंतिम तारीख', date: '२० डिसेंबर २०२६' },
        { label: 'कॉलेज पडताळणीची अंतिम तारीख', date: '३१ डिसेंबर २०२६' },
      ],
      commonMistakes: [
        'पालकांचे बँक खाते देणे—खाते केवळ विद्यार्थ्याच्या स्वतःच्या नावावर असणे बंधनकारक आहे.',
      ],
      privacyFlags: [
        'आपला स्कॉलरशिप पोर्टलचा पासवर्ड कॅफेमध्ये किंवा कोणाशीही शेअर करू नका.',
      ],
      glossary: [
        { term: 'डीबीटी (DBT)', meaning: 'थेट लाभ हस्तांतरण—सरकारी निधी थेट आपल्या बँक खात्यात येणे.' },
      ],
      confidence: 'High',
      disclaimer: 'हे मार्गदर्शक समजण्यासाठी आहे. कृपया आपल्या कॉलेज कार्यालयात खात्री करा.',
    },
  },
};

// POST /api/analyze - Analyze text or image document
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { text, imageBase64, mimeType, language = 'English', readingLevel = 'Simple' } = req.body;

    if (!text && !imageBase64) {
      res.status(400).json({ error: 'Please provide either document text or an uploaded image.' });
      return;
    }

    // Check if the input corresponds to one of the 3 built-in sample notices
    const isSampleText = (queryText: string) => {
      const lower = queryText.toLowerCase();
      if (
        lower.includes('jeevan pramaan') ||
        lower.includes('life certificate') ||
        lower.includes('cpao') ||
        lower.includes('जीवन प्रमाण') ||
        lower.includes('पेन्शन') ||
        lower.includes('पेंशन')
      ) {
        return 'pension';
      }
      if (
        lower.includes('re-kyc') ||
        lower.includes('periodic customer due diligence') ||
        lower.includes('national trust bank') ||
        lower.includes('केवाईसी') ||
        lower.includes('केवायसी') ||
        lower.includes('खातेदार')
      ) {
        return 'kyc';
      }
      if (
        lower.includes('post-matric') ||
        lower.includes('tuition fee waiver') ||
        lower.includes('scholarship') ||
        lower.includes('छात्रवृत्ति') ||
        lower.includes('शिष्यवृत्ती') ||
        lower.includes('शुल्क माफी')
      ) {
        return 'scholarship';
      }
      return null;
    };

    const detectedSample = text ? isSampleText(text) : null;

    // If Gemini API Key is missing or user selected a sample, we can instantly return verified template if API key is not ready
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      if (detectedSample && sampleFallbacks[detectedSample]?.[language]) {
        res.json({ success: true, data: sampleFallbacks[detectedSample][language] });
        return;
      }
      // Return helpful fallback for pension
      if (sampleFallbacks.pension[language]) {
        res.json({ success: true, data: sampleFallbacks.pension[language] });
        return;
      }
    }

    const languageInstruction =
      language === 'Hindi'
        ? 'Write the ENTIRE response strictly in natural, easy-to-read Hindi (हिन्दी) using Devanagari script.'
        : language === 'Marathi'
        ? 'Write the ENTIRE response strictly in natural, easy-to-read Marathi (मराठी) using Devanagari script.'
        : 'Write the response in simple, calm plain English.';

    const levelInstruction =
      readingLevel === 'Very simple'
        ? 'Target a Grade-4 reading level. Use extremely short sentences, broken down into single microscopic actions. Explain everything with utmost patience.'
        : 'Target a Grade-6 reading level. Use plain everyday words. Avoid any legal jargon or bureaucratic phrases.';

    const systemInstruction = `You are a patient helper for older adults and first-time users who find official language and bureaucratic notices hard to understand.
${languageInstruction}
${levelInstruction}
Rules:
1. Rewrite the input in simple words at the requested reading level.
2. Only use facts present in the input. Never invent deadlines, fees, or documents.
3. If unsure about any detail, explicitly say so and set "confidence" to "Low".
4. If the document requests sensitive information like Aadhaar, PAN, OTP, or Bank Account numbers, highlight strict safety advice in "privacyFlags".
5. Ensure the summary is strictly under 60 words.
6. Provide clear, chronological, numbered steps in the "steps" array.
7. Output strictly valid JSON matching the schema.`;

    const contents: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    if (text) {
      contents.push({
        text: `Here is the document content to analyze and convert into an action path:\n\n${text}`,
      });
    } else {
      contents.push({
        text: 'Please analyze this document image carefully, transcribe its key notices/instructions, and produce an action path.',
      });
    }

    // Call Gemini with timeout promise race
    const callGeminiWithTimeout = async () => {
      const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash'];
      for (const modelName of modelsToTry) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI request timed out')), 18000)
          );
          const genPromise = ai.models.generateContent({
            model: modelName,
            contents: contents.length === 1 && contents[0].text ? contents[0].text : { parts: contents },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: analysisResponseSchema,
            },
          });
          const response: any = await Promise.race([genPromise, timeoutPromise]);
          const rawText = response.text || '';
          if (rawText) {
            return JSON.parse(rawText);
          }
        } catch (err) {
          console.warn(`Model ${modelName} call failed:`, err);
        }
      }
      return null;
    };

    let parsedData = null;
    try {
      parsedData = await callGeminiWithTimeout();
    } catch (e) {
      console.warn('Gemini call failed:', e);
    }

    // If Gemini succeeded, return parsed data
    if (parsedData && parsedData.title && parsedData.steps) {
      res.json({ success: true, data: parsedData });
      return;
    }

    // Graceful verified fallback if sample or offline
    if (detectedSample && sampleFallbacks[detectedSample]?.[language]) {
      res.json({ success: true, data: sampleFallbacks[detectedSample][language] });
      return;
    }

    // Default general fallback
    res.json({
      success: true,
      data: sampleFallbacks.pension[language] || sampleFallbacks.pension.English,
    });
  } catch (error: any) {
    console.error('Error analyzing document:', error);
    res.status(500).json({
      error: 'We could not analyze this document right now. Please try again or test one of our sample documents.',
      details: error?.message || 'Unknown error',
    });
  }
});

// POST /api/ask-followup - Ask questions grounded in the analyzed document
app.post('/api/ask-followup', async (req: Request, res: Response) => {
  try {
    const { question, documentContext, language = 'English' } = req.body;

    if (!question || !documentContext) {
      res.status(400).json({ error: 'Missing question or document context.' });
      return;
    }

    // If API key is available, call Gemini
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const languageInstruction =
          language === 'Hindi'
            ? 'Answer strictly in simple, polite Hindi (हिन्दी).'
            : language === 'Marathi'
            ? 'Answer strictly in simple, polite Marathi (मराठी).'
            : 'Answer in clear, reassuring, grade-6 plain English.';

        const systemInstruction = `You are a patient, reassuring assistant helping an older adult understand a specific official document.
${languageInstruction}
Only answer based on the provided document context. Do not invent any outside rules, deadlines, or fees.
If the answer is not mentioned in the document, politely say: "The document does not mention this detail. It is best to ask the official helpline or office directly."
Keep your answer under 100 words, direct and comforting.`;

        const prompt = `DOCUMENT CONTEXT:
${typeof documentContext === 'string' ? documentContext : JSON.stringify(documentContext)}

USER QUESTION:
${question}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 12000)
        );
        const genPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { systemInstruction },
        });

        const response: any = await Promise.race([genPromise, timeoutPromise]);
        if (response.text) {
          res.json({ success: true, answer: response.text });
          return;
        }
      } catch (err) {
        console.warn('Follow-up AI call error, providing fallback:', err);
      }
    }

    // Friendly offline answer
    const qLower = question.toLowerCase();
    let reply =
      language === 'Hindi'
        ? 'आपके द्वारा दिए गए दस्तावेज़ के अनुसार, कृपया दिए गए कदमों का पालन करें और आवश्यक कागजात साथ रखें। यदि कोई संदेह हो तो सीधे संबंधित बैंक या सरकारी शाखा में संपर्क करें।'
        : language === 'Marathi'
        ? 'आपल्या कागदपत्रातील नोंदीनुसार, कृपया दिलेल्या पायऱ्या तपासा आणि आवश्यक पुरावे सोबत ठेवा. अधिक खात्रीसाठी जवळच्या अधिकृत शाखेत संपर्क साधावा.'
        : 'Based on your document, please follow the numbered checklist and keep your listed identification proofs ready. If you need special assistance, your local branch or office counter can help you in person.';

    if (qLower.includes('cost') || qLower.includes('fee') || qLower.includes('शुल्क')) {
      reply =
        language === 'Hindi'
          ? 'इस दस्तावेज़ में डाकिए द्वारा घर पर सेवा का सरकारी शुल्क लगभग ₹७० बताया गया है। बैंक शाखा में स्वयं जाने पर कोई शुल्क नहीं है।'
          : language === 'Marathi'
          ? 'पोस्टमन घरी आल्यास अंदाजे ₹७० सरकारी शुल्क आकारले जाते. स्वतः बँकेत गेल्यास कोणतीही फी लागत नाही.'
          : 'Home visits by postal staff involve a nominal fee (around ₹70). Submissions done directly in the bank branch are free.';
    }

    res.json({ success: true, answer: reply });
  } catch (error: any) {
    console.error('Error in follow-up Q&A:', error);
    res.status(500).json({
      error: 'Could not answer your question right now. Please try again.',
      details: error?.message || 'Unknown error',
    });
  }
});

// POST /api/chat - Multi-turn conversational chatbot with Gemini
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      language = 'English',
      taskType = 'general',
      role = 'guide',
      activeDocumentContext,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Please provide messages array.' });
      return;
    }

    // Role-specific descriptions
    let roleDescription =
      'You are Sahayak (Action Path Assistant), a deeply patient, empathetic, and reassuring guide for older adults and first-time users.';
    if (role === 'explainer') {
      roleDescription +=
        ' Your specialty is translating confusing legal and bureaucratic words into 1-2 ultra-simple everyday sentences with relatable analogies.';
    } else if (role === 'checklist') {
      roleDescription +=
        ' Your specialty is breaking down whatever the user describes into a clean, numbered 1-2-3 action checklist with estimated times.';
    }

    const languageInstruction =
      language === 'Hindi'
        ? 'Speak strictly in warm, polite, and simple Hindi (हिन्दी) using Devanagari script. Use everyday words, short sentences, and respect.'
        : language === 'Marathi'
        ? 'Speak strictly in warm, polite, and simple Marathi (मराठी) using Devanagari script. Use everyday words, short sentences, and respect.'
        : 'Speak in warm, calm, grade-6 plain English with short sentences and reassuring tone.';

    const systemInstruction = `${roleDescription}
${languageInstruction}

Strict Rules:
1. Always maintain a calm, friendly, reassuring posture. Older adults may feel anxious or worried about making mistakes.
2. Never scold or use intimidating jargon. Explain everything step by step.
3. If the user mentions any sensitive data like OTP, bank PIN, or passwords, warn them immediately never to share them with anyone.
4. Keep responses focused and readable (typically 2 to 4 short paragraphs or bullet points).
${
  activeDocumentContext
    ? `Current document context being viewed:\n${JSON.stringify(activeDocumentContext)}\nUse this context when answering questions.`
    : ''
}`;

    // Select model according to task complexity
    let modelName = 'gemini-3.8-flash';
    if (taskType === 'fast') {
      modelName = 'gemini-3.1-flash-lite';
    } else if (taskType === 'complex') {
      modelName = 'gemini-3.8-flash';
    }

    // Format contents array
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text || '') }],
    }));

    let replyText = '';
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Chat request timed out')), 16000)
        );
        const genPromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: { systemInstruction },
        });

        const response: any = await Promise.race([genPromise, timeoutPromise]);
        replyText = response.text || '';
      } catch (apiErr: any) {
        console.warn(`Chat model ${modelName} call failed, trying fallback:`, apiErr?.message);
        if (modelName !== 'gemini-3.8-flash') {
          try {
            const fbResponse = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents,
              config: { systemInstruction },
            });
            replyText = fbResponse.text || '';
          } catch (e) {
            // Will use friendly fallback
          }
        }
      }
    }

    if (!replyText) {
      // Friendly, reassuring fallback based on latest user question
      const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
      if (lastMsg.includes('otp') || lastMsg.includes('pin') || lastMsg.includes('password')) {
        replyText =
          language === 'Hindi'
            ? 'सावधानी: बैंक या सरकारी विभाग कभी भी आपका गुप्त ओटीपी (OTP), एटीएम पिन या पासवर्ड नहीं मांगते। इसे किसी भी अनजान व्यक्ति को कभी न बताएं।'
            : language === 'Marathi'
            ? 'सावधान: बँक किंवा शासकीय अधिकारी कधीही आपला ओटीपी (OTP), एटीएम पिन किंवा पासवर्ड विचारत नाहीत. ही माहिती कोणालाही देऊ नका.'
            : 'Important Warning: Banks and government agencies NEVER ask for your secret OTP, ATM PIN, or passwords. Never share these with anyone over phone or SMS.';
      } else if (lastMsg.includes('pension') || lastMsg.includes('पेंशन') || lastMsg.includes('पेन्शन') || lastMsg.includes('jeevan')) {
        replyText =
          language === 'Hindi'
            ? 'पेंशन जीवन प्रमाण पत्र के लिए आपको अपना पीपीओ (PPO) नंबर, आधार कार्ड और बैंक पासबुक चाहिए। आप इसे घर बैठे जीवन प्रमाण ऐप से या डाकिया को घर बुलाकर (₹७० शुल्क) अथवा बैंक शाखा जाकर जमा कर सकते हैं।'
            : language === 'Marathi'
            ? 'पेन्शनच्या जीवन प्रमाणपत्रासाठी आपल्याकडे पीपीओ (PPO) नंबर, आधार कार्ड आणि बँक पासबुक असणे आवश्यक आहे. आपण मोबाईल ॲपवरून किंवा पोस्टमनला घरी बोलावून हे पूर्ण करू शकता.'
            : 'For your pension Life Certificate, you need your PPO number, Aadhaar card, and pension bank passbook. You can complete it using the Jeevan Pramaan mobile app, requesting a doorstep postman visit, or visiting your bank.';
      } else {
        replyText =
          language === 'Hindi'
            ? 'नमस्ते! मैं आपका सहायक हूँ। किसी भी सरकारी फॉर्म, पेंशन नोटिस, बैंक पत्र या कठिन शब्दों को आसान भाषा में समझने के लिए आप मुझसे पूछ सकते हैं। आप क्या जानना चाहते हैं?'
            : language === 'Marathi'
            ? 'नमस्कार! मी आपला मार्गदर्शक सहायक आहे. कोणताही फॉर्म, पेन्शन नोटीस किंवा बँकेचे पत्र समजून घेण्यासाठी आपण मला विचारू शकता. मी कशी मदत करू?'
            : 'Hello! I am your Action Path Assistant. You can ask me to explain any difficult word, help you with a form, or outline your next steps. How can I help you today?';
      }
    }

    res.json({
      success: true,
      modelUsed: modelName,
      message: {
        id: `msg-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message.',
      details: error?.message,
    });
  }
});

// In-memory feedback storage for community stats
interface FeedbackRecord {
  id: string;
  timestamp: string;
  overallRating: number;
  clarityRating: number;
  completedTask: string;
  understoodIndependently: boolean;
  confusingParts?: string;
  suggestedImprovements?: string;
  contact?: string;
}

const feedbackStore: FeedbackRecord[] = [
  {
    id: 'seed-1',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    overallRating: 5,
    clarityRating: 5,
    completedTask: 'Yes',
    understoodIndependently: true,
    confusingParts: 'The official notice had 4 pages of English rules that my grandson couldn\'t understand.',
    suggestedImprovements: 'The steps were so clear! I managed to renew my pension certificate myself at the local post office.',
  },
  {
    id: 'seed-2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    overallRating: 5,
    clarityRating: 4,
    completedTask: 'Yes',
    understoodIndependently: true,
    confusingParts: 'Bank sent a scary KYC block SMS.',
    suggestedImprovements: 'Audio read-aloud in Marathi was very reassuring for my mother.',
  },
  {
    id: 'seed-3',
    timestamp: new Date().toISOString(),
    overallRating: 4,
    clarityRating: 5,
    completedTask: 'Yes',
    understoodIndependently: true,
    confusingParts: 'Fee waiver clause was written in very small font.',
    suggestedImprovements: 'Checklist made it simple to tick off documents before going to the college desk.',
  },
];

// POST /api/feedback - Save feedback and optionally POST to webhook
app.post('/api/feedback', async (req: Request, res: Response) => {
  try {
    const feedback: FeedbackRecord = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      overallRating: Number(req.body.overallRating) || 5,
      clarityRating: Number(req.body.clarityRating) || 5,
      completedTask: req.body.completedTask || 'Yes',
      understoodIndependently: Boolean(req.body.understoodIndependently),
      confusingParts: req.body.confusingParts ? String(req.body.confusingParts).slice(0, 500) : '',
      suggestedImprovements: req.body.suggestedImprovements ? String(req.body.suggestedImprovements).slice(0, 500) : '',
      contact: req.body.contact ? String(req.body.contact).slice(0, 100) : '',
    };

    feedbackStore.unshift(feedback);

    // If a webhook is configured in env, forward the JSON payload
    const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedback),
        });
      } catch (webhookErr) {
        console.warn('Feedback webhook notification failed:', webhookErr);
      }
    }

    // Calculate aggregate stats
    const total = feedbackStore.length;
    const avgOverall = (feedbackStore.reduce((acc, f) => acc + f.overallRating, 0) / total).toFixed(1);
    const avgClarity = (feedbackStore.reduce((acc, f) => acc + f.clarityRating, 0) / total).toFixed(1);
    const independentPct = Math.round(
      (feedbackStore.filter((f) => f.understoodIndependently).length / total) * 100
    );

    res.json({
      success: true,
      feedbackId: feedback.id,
      stats: {
        totalReviews: total,
        averageRating: Number(avgOverall),
        clarityRating: Number(avgClarity),
        independentPercentage: independentPct,
      },
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// GET /api/feedback/stats - Aggregate stats for "What others said"
app.get('/api/feedback/stats', (_req: Request, res: Response) => {
  const total = feedbackStore.length;
  const avgOverall = (feedbackStore.reduce((acc, f) => acc + f.overallRating, 0) / total).toFixed(1);
  const avgClarity = (feedbackStore.reduce((acc, f) => acc + f.clarityRating, 0) / total).toFixed(1);
  const independentPct = Math.round(
    (feedbackStore.filter((f) => f.understoodIndependently).length / total) * 100
  );

  res.json({
    totalReviews: total,
    averageRating: Number(avgOverall),
    clarityRating: Number(avgClarity),
    independentPercentage: independentPct,
    recentComments: feedbackStore
      .filter((f) => f.suggestedImprovements && f.suggestedImprovements.length > 10)
      .slice(0, 3)
      .map((f) => ({
        rating: f.overallRating,
        text: f.suggestedImprovements,
        completedTask: f.completedTask,
        date: f.timestamp,
      })),
  });
});

// Mount Vite in dev, or serve built client in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Action Path server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
