/* ------------------------------------------------------------------
   EDIT THIS FILE to change what the website shows.
   - "profile" is the first destination (About Me).
   - "seminars" are the next destinations, in the same order as the road.
     Add, remove or reorder items and the road rebuilds itself.

   Each stop has:
     title, date, speaker, venue, organizer   text shown on the card and panel
     tag, short      optional labels (default "Seminar 01" / "Seminar 1")
     screenshots     list of image paths ([] hides the section)
     takeaway        ONE key takeaway (a few short sentences)
     links           clickable links: { label, url } or just "https://..."
                     (leave as [] and the Links section is hidden)
     certificate     one image (.jpg/.png) or PDF path, or { title, by, date, note, image, pdf, transcript }
     certificates    OR a list of those (each gets its own card)

   Image paths are relative to this folder. If a file is missing, the
   page shows a placeholder that tells you which file to add.
------------------------------------------------------------------- */
const EPCPS = 'Ethel Programming Computer Programming Services';
const MEET_1H = 'Online via Google Meet · 1 hr';
const UNI = 'UniAthena · Cambridge International Qualifications';

window.PORTFOLIO = {
  profile: {
    name: 'Trisha C. Magnosay',
    course: 'Bachelor of Science in Information Technology',
    school: 'Partido State University',
    subject: 'Seminar and Tours (ST1)',
    tagline: 'Welcome to my ST1 portfolio. Drive along the road to visit each seminar I attended, in order.',
    photo: 'assets/profile.jpg'
  },

  seminars: [
    {
      title: 'AI + IoT: The Future of Smart Technology Is Here',
      date: 'August 18, 2026',
      speaker: 'Ms. Jasmine Kate Patiño',
      venue: MEET_1H,
      organizer: EPCPS,
      screenshots: [
        'assets/01-ai-iot/screenshot-1.jpg',
        'assets/01-ai-iot/screenshot-2.jpg',
        'assets/01-ai-iot/screenshot-3.jpg',
        'assets/01-ai-iot/screenshot-4.jpg'
      ],
      takeaway: 'AI lets devices learn from data and IoT gives them the sensors to collect it, so the two work best together. Small AI-capable boards like the ESP32-S3 can process data right on the device, which makes smart tools cheaper and faster. A clear example was predictive maintenance, where sensors spot unusual behavior and AI predicts a failure before the machine breaks down.',
      links: [],
      certificate: 'assets/01-ai-iot/certificate.jpg'
    },
    {
      title: 'Secure by Design: UI and UX for Cybersecurity and IoT',
      date: 'August 19, 2026',
      speaker: 'Mr. Ryan Jeffrey Ricafort',
      venue: MEET_1H,
      organizer: EPCPS,
      screenshots: [
        'assets/02-secure-by-design/screenshot-1.jpg',
        'assets/02-secure-by-design/screenshot-2.jpg',
        'assets/02-secure-by-design/screenshot-3.jpg',
        'assets/02-secure-by-design/screenshot-4.jpg'
      ],
      takeaway: 'Security has to be designed into a product from the start instead of added later. Good UI and UX make the secure choice the easy choice through clear warnings, safe defaults and least-privilege access. Users are part of the security system, so a product should never make them fight against its own protection.',
      links: [],
      certificate: 'assets/02-secure-by-design/certificate.jpg'
    },
    {
      title: 'Build, Commit, Deploy: Mastering Mobile Development with GitHub',
      date: 'August 20, 2026',
      speaker: 'Mr. Maeron Joseph Reyes',
      venue: MEET_1H,
      organizer: EPCPS,
      screenshots: [
        'assets/03-build-commit-deploy/screenshot-1.jpg',
        'assets/03-build-commit-deploy/screenshot-2.jpg',
        'assets/03-build-commit-deploy/screenshot-3.jpg',
        'assets/03-build-commit-deploy/screenshot-4.jpg'
      ],
      takeaway: 'GitHub can automate the build and deployment of mobile apps, not just store code. Automated pipelines such as GitHub Actions make builds faster and consistent, so the same app compiles the same way on every branch. Branches also keep new work separate from stable code, which reduces human error.',
      links: [],
      certificate: 'assets/03-build-commit-deploy/certificate.jpg'
    },
    {
      title: 'Deploy Your Website: Hosting, Domain and Cloud Deployment',
      date: 'August 21, 2026',
      speaker: 'Mr. Kevin Yu',
      venue: MEET_1H,
      organizer: EPCPS,
      screenshots: [
        'assets/04-deploy-your-website/screenshot-1.jpg',
        'assets/04-deploy-your-website/screenshot-2.jpg',
        'assets/04-deploy-your-website/screenshot-3.jpg'
      ],
      takeaway: 'A website is not really online until it is hosted and connected to a domain. There are free, beginner-friendly hosts such as Vercel, Netlify, GitHub Pages, Render and Cloudflare Pages. Pushing a project to a GitHub repository is the first step toward deploying it to the cloud.',
      links: [],
      certificate: 'assets/04-deploy-your-website/certificate.jpg'
    },
    {
      title: 'IoT: Building Smarter Tools, Connected Systems with AI Tools',
      date: 'August 21, 2026',
      speaker: 'Mr. Chris Tongohan',
      venue: MEET_1H,
      organizer: EPCPS,
      screenshots: [
        'assets/05-iot-smarter-tools/screenshot-1.jpg',
        'assets/05-iot-smarter-tools/screenshot-2.jpg',
        'assets/05-iot-smarter-tools/screenshot-3.jpg',
        'assets/05-iot-smarter-tools/screenshot-4.jpg'
      ],
      takeaway: 'AI and IoT work best together: IoT collects real-time data and AI adds the reasoning and prediction on top of it. The session showed real uses in industry, such as workplace safety and fleet monitoring, and common challenges like data quality, security and integration. I learned that success depends on a clear strategy and goals, not just on having the devices.',
      links: [],
      certificate: 'assets/05-iot-smarter-tools/certificate.jpg'
    },
    {
      title: 'AI Tools for Digital Marketing and Media Literacy',
      date: 'August 22, 2026',
      speaker: 'Mr. John-Bert Villarosa',
      venue: 'Online via Google Meet · 2 hrs',
      organizer: EPCPS,
      screenshots: [
        'assets/06-ai-digital-marketing/screenshot-1.jpg',
        'assets/06-ai-digital-marketing/screenshot-2.jpg'
      ],
      takeaway: 'AI tools can help create marketing content, such as campaign ideas and poster designs, even for a small local business like the coffee shop used in the case study. Good marketing still starts with a clear brand personality and a clear target audience. Media literacy matters too, because we need to think critically about what AI produces before we share it.',
      links: [],
      certificate: 'assets/06-ai-digital-marketing/certificate.jpg'
    },
    {
      title: 'Learning Advocate 2026 Series: Emerging IT Innovations',
      date: 'August 22, 2026',
      speaker: 'Alexander Lopez',
      venue: MEET_1H,
      organizer: 'UpskillTechPH Training Services',
      screenshots: [
        'assets/07-upskilltech/screenshot-1.jpg',
        'assets/07-upskilltech/screenshot-2.jpg',
        'assets/07-upskilltech/screenshot-3.jpg',
        'assets/07-upskilltech/screenshot-4.jpg'
      ],
      takeaway: 'The session covered four big trends, which are generative AI, IoT, edge computing and Web3, and how they are already used in everyday life. It also showed what local employers are looking for right now. The practical roadmap reminded me that I can start building these skills today, even for free.',
      links: [],
      certificate: {
        title: 'Certificate of Participation',
        by: 'UpskillTechPH Training Services',
        date: 'August 22, 2026',
        image: 'assets/07-upskilltech/upskilltech-certificate.jpg',
        pdf: 'assets/07-upskilltech/upskilltech-certificate.pdf'
      }
    },
    {
      title: 'Smart Tech Revolution: IoT, AI and Multimedia',
      date: 'August 22, 2026',
      speaker: 'Mr. Ryan Jeffrey Ricafort',
      venue: MEET_1H,
      organizer: EPCPS,
      screenshots: [
        'assets/08-smart-tech-revolution/screenshot-1.jpg',
        'assets/08-smart-tech-revolution/screenshot-2.jpg',
        'assets/08-smart-tech-revolution/screenshot-3.jpg',
        'assets/08-smart-tech-revolution/screenshot-4.jpg'
      ],
      takeaway: 'IoT connects physical devices so they can collect and exchange data, AI turns that data into decisions, and multimedia makes the results easy to understand. When these three work together they create smarter and more useful systems. The closing reflection reminded me that technology should be used responsibly, with people in mind.',
      links: [],
      certificate: 'assets/08-smart-tech-revolution/certificate.jpg'
    },
    {
      title: 'Secure Web Development: Building Application',
      date: 'August 23, 2026',
      speaker: 'Mr. Maeron Joseph Reyes',
      venue: MEET_1H,
      organizer: EPCPS,
      screenshots: [
        'assets/09-secure-web-dev/screenshot-1.jpg',
        'assets/09-secure-web-dev/screenshot-2.jpg',
        'assets/09-secure-web-dev/screenshot-3.jpg'
      ],
      takeaway: 'Secure web development starts with the basics: use HTTPS, validate and sanitize every user input, use proper authentication and authorization, and keep dependencies updated. Techniques like prepared statements for database queries, rate limiting and secure file uploads help block common attacks. Following the principle of least privilege and running regular security audits keeps an application safe over time.',
      links: [],
      certificate: 'assets/09-secure-web-dev/certificate.jpg'
    },
    {
      title: 'Cybersecurity in iOS and Android Applications Development',
      date: 'August 23, 2026',
      speaker: 'Ms. Ethel Grace Verana',
      venue: 'Online via Google Meet · 1 hr 30 min',
      organizer: EPCPS,
      screenshots: [
        'assets/10-cybersecurity-mobile/screenshot-1.jpg',
        'assets/10-cybersecurity-mobile/screenshot-2.jpg'
      ],
      takeaway: 'Mobile devices and apps face real attacks, such as keystroke injection and remote-access tools, so security cannot be left for later. The demonstrations showed how quickly an attacker can take control when a device or app is not protected. Developers should build iOS and Android apps with security in mind, and users should be careful about what they connect to and install.',
      links: [],
      certificate: 'assets/10-cybersecurity-mobile/certificate.jpg'
    },

    // ---- Other: UniAthena short courses (each has a certificate and a transcript) ----
    {
      tag: 'Short Courses',
      short: 'UniAthena',
      title: 'UniAthena Short Courses',
      date: 'August 19–23, 2026',
      venue: 'Online · 7 courses',
      organizer: 'UniAthena in partnership with Cambridge International Qualifications, UK',
      screenshots: [],
      takeaway: 'These seven short courses covered blockchain, cyber security, cyber law, the internet, information systems and artificial intelligence. I learned how blockchain is used beyond cryptocurrency, in areas like supply chains, drug traceability and land records, and why cyber security and cyber law matter for anyone working online. I completed all seven with a score of 100/100.',
      links: [],
      certificates: [
        {
          title: 'Basics of Cyber Security',
          by: UNI, date: 'August 19, 2026', note: 'Level 4 · 100/100 · Pass',
          image: 'assets/11-uniathena/cr1655-certificate.jpg',
          pdf: 'assets/11-uniathena/cr1655-certificate.pdf',
          transcript: 'assets/11-uniathena/cr1655-transcript.pdf'
        },
        {
          title: 'Basics of Industry Application of Blockchain',
          by: UNI, date: 'August 20, 2026', note: 'Level 7 · 100/100 · Pass',
          image: 'assets/11-uniathena/cr693-certificate.jpg',
          pdf: 'assets/11-uniathena/cr693-certificate.pdf',
          transcript: 'assets/11-uniathena/cr693-transcript.pdf'
        },
        {
          title: 'Basics of Information Systems',
          by: UNI, date: 'August 20, 2026', note: 'Level 5 · 100/100 · Pass',
          image: 'assets/11-uniathena/cr1250-certificate.jpg',
          pdf: 'assets/11-uniathena/cr1250-certificate.pdf',
          transcript: 'assets/11-uniathena/cr1250-transcript.pdf'
        },
        {
          title: 'Basics of Internet',
          by: UNI, date: 'August 22, 2026', note: 'Level 7 · 100/100 · Pass',
          image: 'assets/11-uniathena/cr837-certificate.jpg',
          pdf: 'assets/11-uniathena/cr837-certificate.pdf',
          transcript: 'assets/11-uniathena/cr837-transcript.pdf'
        },
        {
          title: 'Basics of Cyber Law',
          by: UNI, date: 'August 22, 2026', note: 'Level 7 · 100/100 · Pass',
          image: 'assets/11-uniathena/cr844-certificate.jpg',
          pdf: 'assets/11-uniathena/cr844-certificate.pdf',
          transcript: 'assets/11-uniathena/cr844-transcript.pdf'
        },
        {
          title: 'Basics of Artificial Intelligence: Learning Models',
          by: UNI, date: 'August 22, 2026', note: 'Level 7 · 100/100 · Pass',
          image: 'assets/11-uniathena/cr1273-certificate.jpg',
          pdf: 'assets/11-uniathena/cr1273-certificate.pdf',
          transcript: 'assets/11-uniathena/cr1273-transcript.pdf'
        },
        {
          title: 'Basics of Blockchain Applications',
          by: UNI, date: 'August 23, 2026', note: 'Level 7 · 100/100 · Pass',
          image: 'assets/11-uniathena/cr695-certificate.jpg',
          pdf: 'assets/11-uniathena/cr695-certificate.pdf',
          transcript: 'assets/11-uniathena/cr695-transcript.pdf'
        }
      ]
    },

    // ---- Other: Cisco Networking Academy course (no screenshots) ----
    {
      tag: 'Cisco Course',
      short: 'Cisco',
      title: 'IT Customer Support Basics',
      date: 'September 13, 2026',
      venue: 'Online course',
      organizer: 'Cisco Networking Academy',
      screenshots: [],
      takeaway: 'IT customer support is about solving people\'s technical problems, not just fixing devices. Clear communication, patience and listening to what the user actually needs are as important as technical skill. A structured way of troubleshooting and documenting issues helps solve problems faster and keeps customers satisfied.',
      links: [
        { label: 'View my badge on Credly', url: 'https://www.credly.com/badges/24d563dc-ff10-4f7c-9981-af689339f5d2' }
      ],
      certificate: {
        title: 'IT Customer Support Basics',
        by: 'Cisco Networking Academy',
        date: 'September 13, 2026',
        image: 'assets/12-cisco-it-support/certificate.jpg',
        pdf: 'assets/12-cisco-it-support/certificate.pdf'
      }
    }
  ]
};
