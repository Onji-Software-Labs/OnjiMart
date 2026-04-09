console.log("✅ background.js running");

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {

    if (req.action === "SAVE_PRODUCTS") {

        const products = req.payload;

        console.log("📦 Received:", products.length);

        (async () => {

            for (let product of products) {

                try {

                    const res = await fetch("http://35.207.199.225:5000/api/products/create", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(product)
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        console.error("❌ API error:", data);
                    } else {
                        console.log("✅ Saved:", data.name);
                    }

                } catch (err) {
                    console.error("❌ Network error:", err);
                }
            }

            sendResponse({ status: "done" });

        })();

        return true;
    }
});