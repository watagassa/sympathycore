// dbをandroidエミュレータから取得するコマンド
// adb exec-out run-as com.sympathycore cat databases/emotion.db > emotion.db
import SQLite from 'react-native-sqlite-storage';

// データベースを開く
const db = SQLite.openDatabase(
  { name: 'emotion.db', location: 'default' },
  () => console.log('DB opened'),
  err => console.error('DB open error', err),
);

// 初期化処理
db.transaction(tx => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS emotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      score REAL NOT NULL,
      sentiment TEXT NOT NULL
    );`,
  );
});

// 感情データを保存する関数（timestampは関数内で取得）
// await saveEmotion(0.85, 'happy');
export const saveEmotion = (
  score: number,
  emotionType: string,
): Promise<void> => {
  const timestamp = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO emotions (timestamp, score, sentiment) VALUES (?, ?, ?);',
        [timestamp, score, emotionType],
        () => {
          console.log('Saved:', { timestamp, score, emotionType });
          resolve();
        },
        (_, error) => {
          console.error('Insert error:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// 感情データを取得する関数
export const getEmotions = (): Promise<
  { id: number; timestamp: string; score: number; sentiment: string }[]
> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM emotions ORDER BY id DESC;',
        [],
        (_, result) => {
          const rows = result.rows;
          const data: {
            id: number;
            timestamp: string;
            score: number;
            sentiment: string;
          }[] = [];
          for (let i = 0; i < rows.length; i++) {
            data.push(rows.item(i));
          }
          resolve(data);
        },
        (_, error) => {
          console.error('Select error:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getEmotionsFromNDaysAgo = (
  n: number,
): Promise<
  { id: number; timestamp: string; score: number; sentiment: string }[]
> => {
  return new Promise((resolve, reject) => {
    const today = new Date();
    today.setDate(today.getDate() - n); // n日前の日付を計算

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const targetDate = `${yyyy}-${mm}-${dd}`; // 例: "2025-09-18"

    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM emotions
         WHERE DATE(timestamp) = ?
         ORDER BY id DESC;`,
        [targetDate],
        (_, result) => {
          const rows = result.rows;
          const data: {
            id: number;
            timestamp: string;
            score: number;
            sentiment: string;
          }[] = [];
          for (let i = 0; i < rows.length; i++) {
            data.push(rows.item(i));
          }
          resolve(data);
        },
        (_, error) => {
          console.error('Select n-days-ago error:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getLatestEmotion = (): Promise<{
  id: number;
  timestamp: string;
  score: number;
  sentiment: string;
} | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM emotions
         ORDER BY timestamp DESC
         LIMIT 1;`,
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve(null); // データがない場合
          }
        },
        (_, error) => {
          console.error('Select latest error:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const deleteAllEmotions = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM emotions;',
        [],
        () => {
          console.log('Deleted all emotions');
          resolve();
        },
        (_, error) => {
          console.error('Delete all error:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const dropEmotionsTable = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DROP TABLE IF EXISTS emotions;',
        [],
        () => {
          console.log('Dropped emotions table');
          resolve();
        },
        (_, error) => {
          console.error('Drop table error:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};
