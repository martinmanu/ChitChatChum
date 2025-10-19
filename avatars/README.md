# Character Avatars

This folder contains avatar images for each character. When you switch characters using the `/characters` command, the bot will automatically change its profile picture to match the selected character.

## Adding Avatar Images

1. **Image Requirements:**
   - Format: PNG, JPG, or GIF
   - Size: Recommended 512x512 pixels or larger
   - File size: Under 8MB

2. **Naming Convention:**
   The avatar files should match the character keys in config.json:
   - `archer.png` - for the Archer character
   - `barbarian.png` - for the Barbarian character
   - `king.png` - for the Barbarian King
   - `queen.png` - for the Archer Queen
   - `hogrider.png` - for the Hog Rider
   - `warden.png` - for the Grand Warden
   - `champion.png` - for the Royal Champion
   - `minion.png` - for the Minion
   - `woody.png` - for Woody
   - `pirate.png` - for Captain Blackbeard
   - `wizard.png` - for Gandalf the Wise
   - `robot.png` - for R2-D2 Assistant
   - `detective.png` - for Sherlock Holmes
   - `walter.png` - for Walter White

3. **Where to Find Images:**
   - Clash of Clans characters: Official Clash of Clans wiki or game assets
   - Other characters: Search for official artwork or create your own
   - AI-generated: Use tools like DALL-E, Midjourney, or Stable Diffusion

4. **Important Notes:**
   - Discord has rate limits for changing bot avatars (2 changes per hour)
   - If no avatar file exists, the bot will keep its current avatar
   - Make sure you have permission to use any images you add

## Example Usage

After adding avatar images to this folder, use the `/characters` command in Discord to see the interactive character selection menu. When you click a character button, the bot will:
1. Change its personality/responses to match the character
2. Attempt to change its username to the character name
3. Attempt to change its avatar to the character image

Enjoy your character roleplay bot! 🎭