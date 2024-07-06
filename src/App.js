import React, { useEffect, useState, useCallback } from 'react';
import Phaser from 'phaser';
import axios from 'axios';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

function App() {
  const [clickCount, setClickCount] = useState(0);
  const [_tonConnectUI] = useTonConnectUI(); // Prefixed with underscore to indicate intentional non-use
  const userAddress = useTonAddress();

  const sendClickCountToAPI = useCallback(async () => {
    try {
      await axios.post('YOUR_API_ENDPOINT', { clickCount });
      console.log('Click count sent to API');
    } catch (error) {
      console.error('Error sending click count to API:', error);
    }
  }, [clickCount]);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-game',
      scene: {
        preload: preload,
        create: create
      }
    };

    const game = new Phaser.Game(config);

    function preload() {
      this.load.image('button', 'https://labs.phaser.io/assets/sprites/blue_button01.png');
    }

    function create() {
      const button = this.add.image(400, 300, 'button').setInteractive();
      button.on('pointerdown', () => {
        setClickCount(prevCount => prevCount + 1);
      });
    }

    // Telegram Mini App SDK integration
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (clickCount > 0 && clickCount % 10 === 0) {
      sendClickCountToAPI();
    }
  }, [clickCount, sendClickCountToAPI]);

  return (
    <div className="App">
      <h1>Telegram Phaser Game with TON Connect</h1>
      <TonConnectButton />
      {userAddress && (
        <div>
          <p>Connected Wallet Address: {userAddress}</p>
        </div>
      )}
      <div id="phaser-game"></div>
      <p>Click Count: {clickCount}</p>
    </div>
  );
}

export default App;