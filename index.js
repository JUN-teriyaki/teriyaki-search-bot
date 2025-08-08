const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('s')
    .setDescription('ヤフオク・メルカリ・Amazonで検索する')
    .addStringOption(option =>
      option.setName('keyword')
        .setDescription('検索ワードを入力')
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 スラッシュコマンド登録中...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ コマンド登録完了！');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`🤖 ログイン完了: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 's') {
    const keyword = interaction.options.getString('keyword');
    const encoded = encodeURIComponent(keyword);

    const yahooUrl = `https://auctions.yahoo.co.jp/search/search?va=${encoded}&vo=&auccat=0&slider=0`;
    const mercariUrl = `https://www.mercari.com/jp/search/?keyword=${encoded}`;
    const amazonUrl = `https://www.amazon.co.jp/s?k=${encoded}`;

    const embedYahoo = new EmbedBuilder()
      .setColor('#FFCC00')
      .setTitle('🟡 ヤフオクで検索')
      .setDescription(`[「${keyword}」を開く](${yahooUrl})`);

    const embedMercari = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🔴 メルカリで検索')
      .setDescription(`[「${keyword}」を開く](${mercariUrl})`);

    const embedAmazon = new EmbedBuilder()
      .setColor('#00A859')
      .setTitle('🟢 Amazonで検索')
      .setDescription(`[「${keyword}」を開く](${amazonUrl})`);

    await interaction.reply({ embeds: [embedYahoo, embedMercari, embedAmazon] });
  }
});

client.login(process.env.DISCORD_TOKEN);
