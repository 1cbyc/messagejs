import { useState } from 'react';
import { messagejs } from '@messagejs/client';

function App() {
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleSend = async () => {
    messagejs.init('sk_live_demo_key');
    
    try {
      const response = await messagejs.sendMessage({
        connectorId: 'conn_whatsapp',
        templateId: 'tpl_demo',
        to: phone,
        variables: { message }
      });
      setResult(`Success: ${response.messageId}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div>
      <h1>MessageJS React Demo</h1>
      <input
        type="tel"
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
      {result && <p>{result}</p>}
    </div>
  );
}

export default App;
