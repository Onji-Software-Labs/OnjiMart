console.log("Extractor loaded");

if (!window.__extractorRan) {

    window.__extractorRan = true;

    window.addEventListener("load", () => {
        setTimeout(runExtraction, 3000);
    });
}

function runExtraction() {

    const images = document.querySelectorAll("img");
    const seen = new Set();
    const products = [];

    images.forEach(img => {

        if (!img.src) return;

        const src = img.src.toLowerCase();

        // ✅ ONLY real product images
        if (!src.includes("uploads")) return;

        // ❌ skip unwanted images
        if (
            src.includes("banner") ||
            src.includes("slider") ||
            src.includes("logo") ||
            src.includes("background")
        ) return;

        if (seen.has(img.src)) return;
        seen.add(img.src);

        const fileName = img.src.split("/").pop();
        const name = cleanName(fileName);

        if (!name) return;

        products.push({
            name: name,
            description: name,
            price: 100.0,
            stockQuantity: 10,
            quantityType: "COUNT",
            unitValue: "kg",
            minOrderQuantity: 1,
            imageUrl: img.src,
            categoryId: "f257c4f6-06af-410c-a9e8-0eb3785fad9a",
            subCategoryId: getSubCategoryId(name)
        });
    });

    console.log("Extracted:", products.length);

    if (products.length > 0) {
        chrome.runtime.sendMessage({
            action: "SAVE_PRODUCTS",
            payload: products
        });
    }
}


// 🔹 Clean product name
function cleanName(file) {

    let name = file
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .toLowerCase();

    name = name.replace(/\b(mockup|graphic|cropped|side|pack)\b/g, "");
    name = name.replace(/\b(gm|kg|g|ml)\b/g, "");
    name = name.replace(/\d+/g, "");
    name = name.replace(/\s+/g, " ").trim();

    if (name.includes("prime")) {
        name = name.replace("prime", "").trim();
        name = "Prime " + name;
    }

    return name.replace(/\b\w/g, c => c.toUpperCase());
}


// 🔹 Subcategory mapping
function getSubCategoryId(name) {

    const n = name.toLowerCase();

    if (n.includes("chicken")) return "6463e895-49c1-4881-8fff-0f9b40c3b496";
    if (n.includes("mutton")) return "c302076f-db88-4193-ab58-f30301e8514f";
    if (n.includes("fish")) return "ec6a3025-4a9a-4fa0-9182-1f9deaa0d45f";

    return "85786ceb-e438-48a5-b4ca-f7fa98bd4c06";
}