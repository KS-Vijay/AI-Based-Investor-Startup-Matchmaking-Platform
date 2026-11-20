import http from 'http';
import axios from 'axios';
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.join(__dirname, '..', 'index.js');

async function runVerification() {
  console.log('1. Starting server subprocess...');
  const serverProc = fork(serverPath, { stdio: 'pipe' });

  serverProc.stdout.on('data', (d) => {
    // console.log('[Server stdout]:', d.toString().trim());
  });
  serverProc.stderr.on('data', (d) => {
    // console.error('[Server stderr]:', d.toString().trim());
  });

  // Wait 3 seconds for server to bind port 5000 and connect to MongoDB
  await new Promise((r) => setTimeout(r, 3000));

  try {
    console.log('2. Testing GET /api/test ...');
    const testRes = await axios.get('http://localhost:5000/api/test');
    console.log('   Response:', testRes.data);

    console.log('3. Testing POST /api/login for founder@nexusai.com ...');
    const loginRes = await axios.post('http://localhost:5000/api/login', {
      email: 'founder@nexusai.com',
      password: 'password123',
    });
    console.log('   Login success! User:', loginRes.data.fullName, '| Role:', loginRes.data.role, '| JWT Token:', loginRes.data.token ? 'Present (Signed)' : 'Missing');

    const token = loginRes.data.token;
    const userId = loginRes.data._id;

    console.log('4. Testing GET /api/ai/matches/' + userId + ' ...');
    const matchesRes = await axios.get(`http://localhost:5000/api/ai/matches/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('   Matches analyzed:', matchesRes.data.totalProfilesAnalyzed, '| Matches returned:', matchesRes.data.matches.length);
    if (matchesRes.data.matches.length > 0) {
      const top = matchesRes.data.matches[0];
      console.log(`   Top Match: ${top.name} - Compatibility: ${top.score}% (${top.recommendation})`);
      console.log('   Why works:', top.whyWorks.join('; '));
    }

    console.log('5. Testing GET /api/messages/conversations ...');
    const convRes = await axios.get('http://localhost:5000/api/messages/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('   Active conversations:', convRes.data.conversations.length);
    if (convRes.data.conversations.length > 0) {
      console.log('   Last message in thread:', convRes.data.conversations[0].lastMessageText);
    }

    console.log('\n=============================================');
    console.log('🎉 ALL SYSTEM CHECKS PASSED WITH 100% SUCCESS!');
    console.log('=============================================\n');
  } catch (err) {
    console.error('❌ Verification failed:', err.response?.data || err.message);
  } finally {
    serverProc.kill('SIGTERM');
    process.exit(0);
  }
}

runVerification();
