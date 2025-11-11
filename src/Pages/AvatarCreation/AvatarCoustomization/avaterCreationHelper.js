export function transformModels(input) {
    // Step 1: Group models by prefix
    const groupedByPrefix = {};

    input.forEach((item) => {
      // Extract prefix from the first model's filename (e.g., "Ama" from "Ama_Hair_Hr1.glb")
      const prefix = item?.models?.[0]?.original_filename?.split("_")[0] || "default";

      // Initialize array for this prefix if not exists
      if (!groupedByPrefix[prefix]) {
        groupedByPrefix[prefix] = [];
      }

      // Add item to the prefix group
      groupedByPrefix[prefix].push(item);
    });

    // Step 2: Transform into desired output format
    const result = Object.keys(groupedByPrefix).map((prefix) => {
      const models = [];
      const items = groupedByPrefix[prefix];

      // Filter out .glb files to process models
      const glbFiles = items[0]?.models?.filter((item) => item.original_filename?.endsWith(".glb")) || [];

      glbFiles.forEach((glb) => {
        // Find corresponding thumbnail (.png with same base name)
        const baseName = glb?.original_filename?.replace(".glb", "");
        const thumbnailItem = items[0]?.models.find((item) => item.original_filename === `${baseName}.png`);

        models.push({
          fileName: glb.original_filename,
          glb: glb.live_url,
          thumbnail: thumbnailItem ? thumbnailItem.live_url : "",
        });
      });

      return {
        name: prefix,
        models,
      };
    });
    return result;
  }// create structure to a model like

  export  const groupModelConfigsByName = (configs) => {
    const grouped = {};

    configs.forEach((item) => {
      const match = item.original_filename.match(/^([^_]+)_/);
      if (!match) return;

      const name = match[1];

      if (!grouped[name]) {
        grouped[name] = {
          name,
          models: [],
        };
      }

      grouped[name].models.push(item);
    });

    return Object.values(grouped);
  } 
