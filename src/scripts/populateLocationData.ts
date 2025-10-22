// Script to populate location data in the database
// Run this script after the migration has been applied

import { LocationDataService } from '../services/locationDataService';

async function main() {
  console.log('🚀 Starting location data population...');
  
  try {
    // Check if data is already populated
    const isPopulated = await LocationDataService.isLocationDataPopulated();
    
    if (isPopulated) {
      console.log('✅ Location data is already populated');
      
      // Show current stats
      const stats = await LocationDataService.getLocationStats();
      console.log('📊 Current location data stats:');
      console.log(`   Counties: ${stats.counties}`);
      console.log(`   Constituencies: ${stats.constituencies}`);
      console.log(`   Wards: ${stats.wards}`);
      console.log(`   Hotspot Counties: ${stats.hotspotCounties}`);
      
      return;
    }

    // Populate the data
    const result = await LocationDataService.populateLocationData();
    
    if (result.success) {
      console.log('✅ Location data populated successfully!');
      
      // Show final stats
      const stats = await LocationDataService.getLocationStats();
      console.log('📊 Final location data stats:');
      console.log(`   Counties: ${stats.counties}`);
      console.log(`   Constituencies: ${stats.constituencies}`);
      console.log(`   Wards: ${stats.wards}`);
      console.log(`   Hotspot Counties: ${stats.hotspotCounties}`);
    } else {
      console.error('❌ Failed to populate location data:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running location data population:', error);
    process.exit(1);
  }
}

// Run the script
main();
