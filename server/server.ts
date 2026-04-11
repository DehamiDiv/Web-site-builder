import { app } from "./api/index";

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Local server is running on http://localhost:${port}`);
    });
}
