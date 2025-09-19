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
      value REAL NOT NULL,
      emotion_type TEXT NOT NULL
    );`,
  );
});

// 感情データを保存する関数（timestampは関数内で取得）
// await saveEmotion(0.85, 'happy');
export const saveEmotion = (
  value: number,
  emotionType: string,
): Promise<void> => {
  const timestamp = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO emotions (timestamp, value, emotion_type) VALUES (?, ?, ?);',
        [timestamp, value, emotionType],
        () => {
          console.log('Saved:', { timestamp, value, emotionType });
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
  { id: number; timestamp: string; value: number; emotion_type: string }[]
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
            value: number;
            emotion_type: string;
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
  { id: number; timestamp: string; value: number; emotion_type: string }[]
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
            value: number;
            emotion_type: string;
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
