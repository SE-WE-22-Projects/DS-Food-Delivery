import { readFile, glob } from "fs/promises";
import Handlebars, { TemplateDelegate } from "handlebars";
import path from "path";

let templates = new Map<string, TemplateDelegate>();


export const loadTemplates = async () => {
    templates.clear();

    const templateDir = path.join(path.dirname(__dirname), "template");
    const files = glob(`${templateDir}/*.hbs`);

    console.log("Compiling templates...");
    for await (const file of files) {
        const name = path.basename(file).split(".")[0];
        const data = await readFile(file, { encoding: "utf8" });
        templates.set(name, Handlebars.compile(data));
    }
    console.log("Done compiling templates");
}

export const applyTemplate = (name: string, data: any) => {
    let template = templates.get(name);
    if (!template) {
        throw new Error("Template " + name + " not found")
    }

    return template(data);
}

export default applyTemplate;