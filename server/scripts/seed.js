import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import User from '../models/User.js';
import StartupForm from '../models/StartupForm.js';
import InvestorForm from '../models/InvestorForm.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Match from '../models/Match.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investor_matchmaking';

async function seed() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB. Clearing existing demo collections...');

    await User.deleteMany({});
    await StartupForm.deleteMany({});
    await InvestorForm.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Match.deleteMany({});

    console.log('Collections cleared. Seeding Users and Profiles...');

    // 1. Create Demo Startup User
    const startupUser1 = new User({
      fullName: 'Alex Rivera',
      email: 'founder@nexusai.com',
      password: 'password123',
      role: 'startup',
      profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      hasFilledForm: true,
    });
    await startupUser1.save();

    await StartupForm.create({
      userId: startupUser1._id,
      startupName: 'NexusAI Systems',
      websiteUrl: 'https://nexusai-systems.io',
      founderNames: 'Alex Rivera, Dr. Priya Shah',
      email: 'founder@nexusai.com',
      phone: '+1 (415) 890-1234',
      linkedinProfiles: 'https://linkedin.com/in/alex-rivera-nexus',
      numberOfFounders: '2',
      teamSize: '8',
      founderBackground: 'Ex-Google Cloud Tech Lead, Stanford CS MS; PhD in AI Systems',
      previousStartupExperience: true,
      teamSkills: ['PyTorch', 'Distributed Systems', 'LLMOps', 'React', 'Rust'],
      industry: ['Artificial Intelligence', 'B2B SaaS', 'DevTools'],
      problemStatement: 'Enterprise engineering teams waste 35% of their sprint velocity manually tracing and debugging non-deterministic LLM pipeline failures.',
      productDescription: 'Autonomous observability and automated guardrail platform for production multi-agent and LLM applications.',
      businessModel: 'Usage-based B2B SaaS with tiers from $499/mo to $2,500/mo enterprise plans.',
      techStack: 'Python, TypeScript, React, Rust, Kafka, PostgreSQL, Vector DB',
      startupStage: 'Seed',
      monthlyRevenue: '$48,000',
      activeUsers: '14,200',
      fundingRaised: '$300,000 (Pre-Seed)',
      customerRetention: '94%',
      growthRate: '24% MoM',
      fundingAmount: '$1,500,000',
      useOfFunds: ['45% Engineering & R&D', '35% GTM & Enterprise Sales', '20% Compute & Infra'],
      fundingRoundType: 'Seed',
      equityOffering: '12%',
      headquarters: 'San Francisco, CA',
      operatingMarkets: ['North America', 'Western Europe'],
      expansionPlan: 'Expand into enterprise SOC-2 compliance features and launch self-hosted version.',
    });

    // 2. Create More Diverse Startups
    const startupUser2 = new User({
      fullName: 'Maya Lin',
      email: 'maya@biogenix.health',
      password: 'password123',
      role: 'startup',
      profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      hasFilledForm: true,
    });
    await startupUser2.save();

    await StartupForm.create({
      userId: startupUser2._id,
      startupName: 'BioGenix Health',
      websiteUrl: 'https://biogenix.health',
      founderNames: 'Maya Lin, Marcus Thorne',
      email: 'maya@biogenix.health',
      industry: ['Healthcare', 'Artificial Intelligence', 'Biotech'],
      problemStatement: 'Early detection of rare oncology biomarkers currently requires multi-week invasive lab panels.',
      productDescription: 'AI-assisted liquid biopsy biomarker analysis engine achieving 97% detection sensitivity in 24 hours.',
      businessModel: 'Per-assay diagnostic licensing fee to hospital networks.',
      startupStage: 'Series A',
      monthlyRevenue: '$110,000',
      growthRate: '18% MoM',
      fundingAmount: '$4,000,000',
      fundingRoundType: 'Series A',
      headquarters: 'Boston, MA',
    });

    const startupUser3 = new User({
      fullName: 'Tariq Hassan',
      email: 'tariq@verdecarbon.earth',
      password: 'password123',
      role: 'startup',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      hasFilledForm: true,
    });
    await startupUser3.save();

    await StartupForm.create({
      userId: startupUser3._id,
      startupName: 'VerdeCarbon',
      websiteUrl: 'https://verdecarbon.earth',
      founderNames: 'Tariq Hassan',
      email: 'tariq@verdecarbon.earth',
      industry: ['CleanTech', 'Fintech', 'Sustainability'],
      problemStatement: 'Corporate carbon credit trading is rife with double-counting and lack of transparent audit trails.',
      productDescription: 'Automated satellite IoT verification and verifiable carbon credit marketplace for industrial emitters.',
      businessModel: '2.5% transaction marketplace fee + ESG compliance subscription.',
      startupStage: 'Seed',
      monthlyRevenue: '$32,000',
      growthRate: '28% MoM',
      fundingAmount: '$2,000,000',
      fundingRoundType: 'Seed',
      headquarters: 'Austin, TX',
    });

    const startupUser4 = new User({
      fullName: 'Chloe Dupont',
      email: 'chloe@shieldlayer.io',
      password: 'password123',
      role: 'startup',
      profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      hasFilledForm: true,
    });
    await startupUser4.save();

    await StartupForm.create({
      userId: startupUser4._id,
      startupName: 'ShieldLayer AI',
      websiteUrl: 'https://shieldlayer.io',
      founderNames: 'Chloe Dupont, Ethan Vance',
      email: 'chloe@shieldlayer.io',
      industry: ['Cybersecurity', 'Artificial Intelligence', 'B2B SaaS'],
      problemStatement: 'APIs and microservices are vulnerable to zero-day credential stuffing that evades traditional WAFs.',
      productDescription: 'Behavioral zero-trust API protection using dynamic graph neural networks.',
      businessModel: 'Annual enterprise contracts ($25k - $120k ARR).',
      startupStage: 'Seed',
      monthlyRevenue: '$55,000',
      growthRate: '30% MoM',
      fundingAmount: '$2,500,000',
      fundingRoundType: 'Seed',
      headquarters: 'New York, NY',
    });

    // 3. Create Demo Investor User
    const investorUser1 = new User({
      fullName: 'Elena Rostova',
      email: 'investor@vanguardvc.com',
      password: 'password123',
      role: 'investor',
      profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      hasFilledForm: true,
    });
    await investorUser1.save();

    await InvestorForm.create({
      userId: investorUser1._id,
      fullName: 'Elena Rostova',
      email: 'investor@vanguardvc.com',
      phone: '+1 (415) 555-0199',
      organization: 'Vanguard Horizon Ventures',
      investorType: 'Venture Capital',
      isAccredited: 'Yes',
      preferredIndustries: ['Artificial Intelligence', 'B2B SaaS', 'DevTools', 'Cybersecurity'],
      preferredStages: ['Seed', 'Series A'],
      ticketSize: '$500K - $2M',
      preferredGeographies: ['United States', 'Western Europe', 'Remote'],
      investmentModel: 'Direct Equity & SAFE',
      coInvestmentInterest: 'Yes, often lead or co-lead rounds',
      hasInvestedBefore: 'Yes',
      numberOfInvestments: '22',
      portfolioHighlights: 'Early backer of 2 AI infrastructure unicorns; focused on deep tech, scalable SaaS & developer ecosystems.',
      riskAppetite: 'High',
      investmentHorizon: '5-8 Years',
      esgInterest: 'Strong preference for ethical AI and transparent data governance.',
    });

    // 4. Create More Investors
    const investorUser2 = new User({
      fullName: 'Marcus Vance',
      email: 'marcus@apexangels.co',
      password: 'password123',
      role: 'investor',
      profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      hasFilledForm: true,
    });
    await investorUser2.save();

    await InvestorForm.create({
      userId: investorUser2._id,
      fullName: 'Marcus Vance',
      email: 'marcus@apexangels.co',
      organization: 'Apex Angel Syndicate',
      investorType: 'Angel Investor',
      preferredIndustries: ['Fintech', 'CleanTech', 'Sustainability'],
      preferredStages: ['Pre-Seed', 'Seed'],
      ticketSize: '$50K - $250K',
      preferredGeographies: ['United States', 'Global'],
      riskAppetite: 'Moderate-High',
      numberOfInvestments: '14',
      portfolioHighlights: 'Active fintech angel, ex-Stripe product director.',
    });

    const investorUser3 = new User({
      fullName: 'Dr. Sarah Jenkins',
      email: 'sarah@bioventures.fund',
      password: 'password123',
      role: 'investor',
      profilePic: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150',
      hasFilledForm: true,
    });
    await investorUser3.save();

    await InvestorForm.create({
      userId: investorUser3._id,
      fullName: 'Dr. Sarah Jenkins',
      email: 'sarah@bioventures.fund',
      organization: 'BioVenture Health Partners',
      investorType: 'Venture Capital',
      preferredIndustries: ['Healthcare', 'Biotech', 'Artificial Intelligence'],
      preferredStages: ['Seed', 'Series A'],
      ticketSize: '$1M - $5M',
      preferredGeographies: ['United States', 'Global'],
      riskAppetite: 'Moderate',
      numberOfInvestments: '30',
      portfolioHighlights: 'Dedicated healthtech fund with $120M AUM.',
    });

    const investorUser4 = new User({
      fullName: 'David Chen',
      email: 'david@futurestack.vc',
      password: 'password123',
      role: 'investor',
      profilePic: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      hasFilledForm: true,
    });
    await investorUser4.save();

    await InvestorForm.create({
      userId: investorUser4._id,
      fullName: 'David Chen',
      email: 'david@futurestack.vc',
      organization: 'FutureStack Capital',
      investorType: 'Micro VC',
      preferredIndustries: ['Artificial Intelligence', 'B2B SaaS', 'DevTools'],
      preferredStages: ['Seed'],
      ticketSize: '$250K - $1M',
      preferredGeographies: ['North America'],
      riskAppetite: 'High',
      numberOfInvestments: '16',
      portfolioHighlights: 'Specialist micro-fund for open-source and dev tools.',
    });

    // 5. Create realistic conversations and messages between Elena Rostova & Alex Rivera
    const demoConversation = new Conversation({
      participants: [startupUser1._id, investorUser1._id],
      lastMessageText: 'Great to connect Alex! Your AI observability metrics look very promising. Can you share the latest deck?',
      lastMessageTime: new Date(),
    });
    await demoConversation.save();

    const m1 = new Message({
      conversationId: demoConversation._id,
      sender: startupUser1._id,
      receiver: investorUser1._id,
      text: 'Hi Elena! Thank you for matching on the platform. We noticed Vanguard Horizon Ventures focuses heavily on AI infrastructure.',
      createdAt: new Date(Date.now() - 3600000 * 2),
      read: true,
    });
    await m1.save();

    const m2 = new Message({
      conversationId: demoConversation._id,
      sender: investorUser1._id,
      receiver: startupUser1._id,
      text: 'Hi Alex! Yes, your focus on autonomous observability for LLM pipelines fits right into our current investment thesis.',
      createdAt: new Date(Date.now() - 3600000),
      read: true,
    });
    await m2.save();

    const m3 = new Message({
      conversationId: demoConversation._id,
      sender: investorUser1._id,
      receiver: startupUser1._id,
      text: 'Great to connect Alex! Your AI observability metrics look very promising. Can you share the latest deck?',
      createdAt: new Date(Date.now() - 600000),
      read: true,
    });
    await m3.save();

    demoConversation.lastMessage = m3._id;
    await demoConversation.save();

    console.log('✅ Database successfully seeded!');
    console.log('\n--- DEMO LOGIN CREDENTIALS ---');
    console.log('Startup Founder Login:');
    console.log('  Email:    founder@nexusai.com');
    console.log('  Password: password123');
    console.log('\nInvestor Login:');
    console.log('  Email:    investor@vanguardvc.com');
    console.log('  Password: password123');
    console.log('-------------------------------\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
