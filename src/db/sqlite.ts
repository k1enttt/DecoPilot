import Database from 'better-sqlite3';
import path from 'path';

// Khởi tạo kết nối SQLite lưu file dưới project root
const dbFile = path.resolve(process.cwd(), 'interior_design.db');
const db = new Database(dbFile, { verbose: console.log });

// Bạn có thể thêm migration hoặc khởi tạo bảng ở đây
export default db;
