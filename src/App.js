import React, { useEffect, useState, useCallback } from 'react';
import Phaser from 'phaser';
import axios from 'axios';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import './App.css'; // We'll create this file for styling

function App() {
  const [clickCount, setClickCount] = useState(0);
  const [telegramUser, setTelegramUser] = useState(null);
  const userAddress = useTonAddress();

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tgApp = window.Telegram.WebApp;
      tgApp.ready();
      setTelegramUser(tgApp.initDataUnsafe.user);
      tgApp.expand();
    }
  }, []);

  const sendClickCountToAPI = useCallback(async () => {
    try {
      const data = {
        clickCount: clickCount,
        userAddress: userAddress || 'Not connected',
        telegramUser: telegramUser,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post('https://apedex.online/app/update-clicks', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Data sent to API', response.data);
    } catch (error) {
      console.error('Error sending data to API:', error);
    }
  }, [clickCount, userAddress, telegramUser]);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: 300,
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
      const button = this.add.image(this.cameras.main.width / 2, 150, 'button')
        .setInteractive()
        .setScale(0.5);
      button.on('pointerdown', () => {
        setClickCount(prevCount => prevCount + 1);
      });
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
      <header className="App-header">
        <h1>Clicker Game</h1>
      </header>
      <main>
        <div id="phaser-game"></div>
        <p className="click-count">Click Count: {clickCount}</p>
        <div className="wallet-section">
          <TonConnectButton />
          {userAddress && (
            <p className="wallet-address">Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</p>
          )}
        </div>
        {telegramUser && (
          <div className="user-info">
            <p>User: {telegramUser.first_name} {telegramUser.last_name}</p>
            <p>ID: {telegramUser.id}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;