import http from 'http';

const API_URL = 'localhost';
const PORT = 5000;
const PATH = '/api/lawyers/verified';

console.log('🧪 Testing Gzip Compression...\n');

const options = {
    hostname: API_URL,
    port: PORT,
    path: PATH,
    method: 'GET',
    headers: {
        'Accept-Encoding': 'gzip, deflate, br'
    }
};

const req = http.request(options, (res) => {
    const contentEncoding = res.headers['content-encoding'];
    const contentLength = res.headers['content-length'];
    
    let rawData = '';
    let chunks = [];
    
    res.on('data', (chunk) => {
        chunks.push(chunk);
        rawData += chunk;
    });
    
    res.on('end', () => {
        const totalBytes = Buffer.concat(chunks).length;
        const decodedSize = rawData.length;
        
        console.log('📦 Response Headers:');
        console.log(`   Content-Encoding: ${contentEncoding || 'none (not compressed)'}`);
        console.log(`   Content-Length: ${contentLength || 'not set'} bytes`);
        console.log(`   Actual Compressed Size: ${totalBytes} bytes`);
        console.log(`   Decompressed Size: ${decodedSize} bytes`);
        
        if (contentEncoding === 'gzip' || contentEncoding === 'br' || contentEncoding === 'deflate') {
            const compressionType = contentEncoding === 'br' ? 'Brotli' : contentEncoding === 'gzip' ? 'Gzip' : 'Deflate';
            const compressionRatio = ((1 - (totalBytes / decodedSize)) * 100).toFixed(1);
            
            console.log(`\n✅ SUCCESS: ${compressionType} compression is working!`);
            console.log(`   Compression saved: ${Math.abs(compressionRatio)}% bandwidth`);
            console.log(`   Original: ${decodedSize} bytes → Compressed: ${totalBytes} bytes`);
            
            if (contentEncoding === 'br') {
                console.log('\n🚀 BONUS: Using Brotli (better than gzip!)');
                console.log('   Brotli provides 20-30% better compression than gzip.');
            }
        } else {
            console.log('\n⚠️  WARNING: Compression not detected');
            console.log('   Response is being sent uncompressed.');
            console.log('\n💡 Possible reasons:');
            console.log('   1. Response too small (under threshold)');
            console.log('   2. Compression middleware not working');
            console.log('   3. Content-Type not compressible');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure your backend server is running on http://localhost:5000');
});

req.end();
