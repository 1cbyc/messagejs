import messagejs from '@nsisong/messagejs';

async function main() {
  messagejs.init({
    apiKey: 'sk_live_demo_key',
    baseUrl: 'http://localhost:3001'
  });

  const result = await messagejs.sendMessage({
    connectorId: 'conn_whatsapp',
    templateId: 'tpl_welcome',
    to: '+1234567890',
    variables: {
      name: 'John',
      code: '12345'
    }
  });

  console.log('Message sent:', result.messageId);
}

main().catch(console.error);
