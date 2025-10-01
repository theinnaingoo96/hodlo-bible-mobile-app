// Debug utility for audio loading issues
export const debugAudioPath = (requirePath: any, psalmName: string) => {
  console.log(`=== Audio Debug for ${psalmName} ===`);
  console.log('requirePath type:', typeof requirePath);
  console.log('requirePath value:', requirePath);
  console.log('requirePath constructor:', requirePath?.constructor?.name);
  
  if (requirePath && typeof requirePath === 'object') {
    console.log('Object keys:', Object.keys(requirePath));
    console.log('Object values:', Object.values(requirePath));
  }
  
  if (typeof requirePath === 'string') {
    console.log('String length:', requirePath.length);
    // console.log('String startsWith check:', requirePath.startsWith ? 'has startsWith method' : 'no startsWith method');
  }
  
  console.log('===============================');
};

// Test function to verify audio file loading
export const testAudioLoading = async () => {
  try {
    console.log('Testing audio file loading...');
    
    // Test Psalm 101
    console.log('=== Testing Psalm 101 ===');
    const psalm101 = require('../assets/audio/Psalm-00101.m4a');
    debugAudioPath(psalm101, 'Psalm 101');
    
    // Test Psalm 102
    console.log('=== Testing Psalm 102 ===');
    const psalm102 = require('../assets/audio/Psalm-00102.m4a');
    debugAudioPath(psalm102, 'Psalm 102');
    
    // Test if we can access the files directly
    console.log('=== Testing direct file access ===');
    try {
      const directPath = '../assets/audio/Psalm-00101.m4a';
      console.log('Direct path:', directPath, typeof directPath);
    } catch (error) {
      console.log('Direct path error:', error);
    }
    
    // Test different approaches to handle the resource
    console.log('=== Testing resource handling ===');
    const testResource = psalm101;
    
    console.log('Original resource:', testResource);
    console.log('String conversion:', String(testResource));
    console.log('Number conversion:', Number(testResource));
    console.log('JSON stringify:', JSON.stringify(testResource));
    
    // Test if it has startsWith method
    if (typeof testResource === 'string') {
      console.log('Has startsWith method:', typeof testResource.startsWith === 'function');
      if (typeof testResource.startsWith === 'function') {
        console.log('startsWith test:', testResource.startsWith('../'));
      }
    } else {
      console.log('Not a string, no startsWith method');
    }
    
    return {
      psalm101,
      psalm102,
      success: true
    };
  } catch (error: any) {
    console.error('Error testing audio loading:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
