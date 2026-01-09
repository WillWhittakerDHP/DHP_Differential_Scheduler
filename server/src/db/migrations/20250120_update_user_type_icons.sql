-- Migration: Update user type icons to match Jose's Vuexy template
-- Date: 2025-01-20
-- Purpose: Update user type (block_profile) icons from Ant Design format to Tabler icons
--          to match the Vuexy admin template icon system

-- Update Buyer icon: DollarOutlined → tabler-shopping-cart
UPDATE block_profiles 
SET icon = 'tabler-shopping-cart'
WHERE name = 'Buyer' 
  AND block_type_ref = (SELECT id FROM block_types WHERE name = 'User Type' LIMIT 1)
  AND (icon IS NULL OR icon != 'tabler-shopping-cart');

-- Update Agent icon: ContactsOutlined → tabler-users
UPDATE block_profiles 
SET icon = 'tabler-users'
WHERE name = 'Agent' 
  AND block_type_ref = (SELECT id FROM block_types WHERE name = 'User Type' LIMIT 1)
  AND (icon IS NULL OR icon != 'tabler-users');

-- Update Owner icon: HomeOutlined → tabler-home
UPDATE block_profiles 
SET icon = 'tabler-home'
WHERE name = 'Owner' 
  AND block_type_ref = (SELECT id FROM block_types WHERE name = 'User Type' LIMIT 1)
  AND (icon IS NULL OR icon != 'tabler-home');

-- Update Inspector icon: EyeOutlined → tabler-clipboard-check
UPDATE block_profiles 
SET icon = 'tabler-clipboard-check'
WHERE name = 'Inspector' 
  AND block_type_ref = (SELECT id FROM block_types WHERE name = 'User Type' LIMIT 1)
  AND (icon IS NULL OR icon != 'tabler-clipboard-check');

-- Log the updates
DO $$
DECLARE
    buyer_count INTEGER;
    agent_count INTEGER;
    owner_count INTEGER;
    inspector_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO buyer_count 
    FROM block_profiles 
    WHERE name = 'Buyer' AND icon = 'tabler-shopping-cart';
    
    SELECT COUNT(*) INTO agent_count 
    FROM block_profiles 
    WHERE name = 'Agent' AND icon = 'tabler-users';
    
    SELECT COUNT(*) INTO owner_count 
    FROM block_profiles 
    WHERE name = 'Owner' AND icon = 'tabler-home';
    
    SELECT COUNT(*) INTO inspector_count 
    FROM block_profiles 
    WHERE name = 'Inspector' AND icon = 'tabler-clipboard-check';
    
    RAISE NOTICE 'Updated user type icons: Buyer (%), Agent (%), Owner (%), Inspector (%)', 
        buyer_count, agent_count, owner_count, inspector_count;
END $$;

