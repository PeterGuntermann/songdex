import { config } from "dotenv";
import { EnvironmentPlugin } from "webpack";

config();

console.log("process.env", process.env);

module.exports = {
    plugins: [
        new EnvironmentPlugin([
            "FOO",
            // "KV_REST_API_TOKEN",
            // "KV_REST_API_URL"
        ]),
    ],
};
