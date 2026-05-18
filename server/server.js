import "dotenv/config"
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

connectDB();

const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`ChessMaster server running on http://localhost:${port}`);
})