const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk').default;
const banner = require('./config/banner');

const checkIn_url = 'https://www.coresky.com/api/taskwall/meme/sign';

// Fungsi untuk membaca token dari file
function getTokens() {
    try {
        const tokens = fs.readFileSync('token.txt', 'utf8')
            .split('\n')
            .map(token => token.trim())
            .filter(token => token);
        
        if (tokens.length === 0) throw new Error('Token file is empty');
        return tokens;
    } catch (error) {
        console.log(chalk.red('Error: Token file is empty or not found.'));
        process.exit(1);
    }
}

// Fungsi untuk melakukan check-in per akun
const dailyCheckIn = async (token, index) => {
    try {
        const headers = {
            Token: token,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        };

        const response = await axios.post(checkIn_url, {}, { headers });

        if (response.data.code === 200) {
            const debug = response.data.debug || {};
            const reward = debug.task?.rewardPoint || 0;

            if (reward > 0) {
                console.log(chalk.green(`✅ [Account ${index + 1}] Check-in successful! Reward: ${reward} points`));
            } else {
                console.log(chalk.yellow(`⚠️ [Account ${index + 1}] Already checked in today!`));
            }
        } else {
            console.log(chalk.red(`❌ [Account ${index + 1}] Check-in failed! Message: ${response.data.message}`));
        }
    } catch (error) {
        console.log(chalk.red(`Error during daily check-in for Account ${index + 1}: ` + error.message));
    }
};

// Fungsi utama untuk check-in semua akun secara otomatis setiap hari
const autoCheckIn = async () => {
    const tokens = getTokens();
    while (true) {
        console.log(chalk.yellow('🚀 Starting daily auto check-in for multiple accounts...'));

        for (let i = 0; i < tokens.length; i++) {
            await dailyCheckIn(tokens[i], i);
        }

        console.log(chalk.blue('⏳ Waiting 24 hours for the next check-in...'));
        await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
    }
};

// Jalankan bot check-in otomatis
autoCheckIn();
