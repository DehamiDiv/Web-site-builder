import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../config/openai.js";

const extractHTML = (content: string) => {
    // 1. Try to find content between <html> and </html> tags
    const htmlMatch = content.match(/<html[\s\S]*?<\/html>/i);
    if (htmlMatch) {
        return htmlMatch[0];
    }
    
    // 2. If no <html> tags, try to strip markdown fences
    return content.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '').trim();
};


// Controller function to make Revision
export const makeRevision = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        const projectId = req.params.projectId as string;
        const { message } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (user.credits < 5) {
            return res.status(403).json({ message: "add more credits to make changes" });
        }

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: "Please enter a valid prompt" });
        }

        const currentProject = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        })
        if (!currentProject) {
            return res.status(404).json({ error: "Project not found" });
        }

        await prisma.conversation.create({
            data: { role: "user", content: message, projectId }
        })

        await prisma.user.update({
            where: { id: userId },
            data: { credits: user.credits - 5 }
        })

        // Enhance user prompt
        const promptEnhancementResponse = await openai.chat.completions.create({
            model: "nvidia/nemotron-3-nano-30b-a3b:free",
            messages: [
                {
                    role: "system",
                    content: `You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

    Enhance this by:
    1. Being specific about what elements to change
    2. Mentioning design details (colors, spacing, sizes)
    3. Clarifying the desired outcome
    4. Using clear technical terms

Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).
`
                },
                {
                    role: "user",
                    content: `User's request: "${message}"`
                }
            ]
        })
        const enhancedPrompt = promptEnhancementResponse.choices[0].message.content;

        await prisma.conversation.create({
            data: {
                role: "assistant",
                content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
                projectId
            }
        })
        await prisma.conversation.create({
            data: {
                role: "assistant",
                content: 'Now generating your website...',
                projectId
            }
        })

        // Generate website code
        const codeGenerationResponse = await openai.chat.completions.create({
            model: "nvidia/nemotron-3-nano-30b-a3b:free",
            messages: [
                {
                    role: "system",
                    content: `You are an expert web developer. 

    CRITICAL REQUIREMENTS:
    - Return ONLY the complete updated HTML code with the requested changes.
    - Use Tailwind CSS for ALL styling (NO custom CSS).
    - Use Tailwind utility classes for all styling changes.
    - Include all JavaScript in <script> tags before closing </body>
    - Make sure it's a complete, standalone HTML document with Tailwind CSS
    - Return the HTML Code Only, nothing else

    Apply the requested changes while maintaining the Tailwind CSS styling approach.
`
                },
                {
                    role: "user",
                    content: `Here is the current website code: "${currentProject.current_code}" The user wants these changes: "${enhancedPrompt}"`
                }
            ]
        })
        const codeRaw = codeGenerationResponse.choices[0].message.content || '';
        console.log("--- RAW AI RESPONSE START (projectController.ts) ---");
        console.log(codeRaw);
        console.log("--- RAW AI RESPONSE END ---");

        const code = extractHTML(codeRaw);

        if(!code || code.trim() === ''){
            console.log("Error: Extracted code is empty.");
            await prisma.conversation.create({
                data: {
                    role: "assistant",
                    content: "Unable to generate website code. Please try again.",
                    projectId
                }
            })
            if(userId){
                await prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        credits: {increment: 5}
                    }
                })
            }
            return res.status(500).json({ error: "Failed to generate website code" });
        }

        // Create version for the project
        const version = await prisma.version.create({
            data: {
                projectId,
                code: code,
                description: "Changes made"
            }
        })

        await prisma.conversation.create({
            data: {
                role: "assistant",
                content: "I've made the changes to your website! You can now preview",
                projectId
            }
        })

        await prisma.websiteProject.update({
            where: { id: projectId },
            data: {
                current_code: code,
                current_version_index: version.id
            }
        })

        res.status(200).json({ credits: user.credits - 5 });
    } catch (error) {
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            })
        }
        console.error("Error making revision:", error);
        res.status(500).json({ error: "Failed to make revision" });
    }
};


// Controller function to rollback to a specific version
export const rollbackToVersion = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const projectId = req.params.projectId as string;
        const versionId = req.params.versionId as string;

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        })
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const version = project.versions.find((v) => v.id === versionId);
        if (!version) {
            return res.status(404).json({ error: "Version not found" });
        }

        await prisma.websiteProject.update({
            where: { id: projectId },
            data: {
                current_code: version.code,
                current_version_index: version.id
            }
        })

        await prisma.conversation.create({
            data: {
                role: "assistant",
                content: "I've rolled back your website to the selected version. You can now preview it.",
                projectId
            }
        })

        res.json({ message: 'Version rolled back successfully' });
    } catch (error) {
        console.error("Error rolling back version:", error);
        res.status(500).json({ error: "Failed to roll back version" });
    }
};


// Controller function to delete a project
export const deleteProject = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const projectId = req.params.projectId as string;

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        })
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        await prisma.websiteProject.delete({
            where: { id: projectId }
        })

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Failed to delete project" });
    }
};


// Controller for getting project code for preview
export const getProjectCode = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const projectId = req.params.projectId as string;
        const versionId = req.params.versionId as string | undefined;

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        })
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        if (versionId) {
            const version = project.versions.find(v => v.id === versionId);
            if (!version) {
                return res.status(404).json({ error: "Version not found" });
            }
            return res.json({ code: version.code });
        }

        res.json({ code: project.current_code });
    } catch (error) {
        console.error("Error getting project code:", error);
        res.status(500).json({ error: "Failed to get project code" });
    }
};


// Get all published projects (public, no auth)
export const getAllPublishedProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.websiteProject.findMany({
            where: { isPublished: true },
            include: {
                user: {
                    select: { name: true, id: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.status(200).json({ projects });
    } catch (error) {
        console.error("Error getting all published projects:", error);
        res.status(500).json({ error: "Failed to get published projects" });
    }
};


// Get a published project by ID (public, no auth)
export const getPublishedProject = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.projectId as string;

        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId }
        })

        if (!project || project.isPublished === false || !project.current_code) {
            return res.status(404).json({ error: "Project not found or not published" });
        }

        res.json({ code: project.current_code });
    } catch (error) {
        console.error("Error getting published project:", error);
        res.status(500).json({ error: "Failed to get published project" });
    }
};


// Controller to save project code manually
export const saveProjectCode = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const projectId = req.params.projectId as string;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        })
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const version = await prisma.version.create({
            data: {
                projectId,
                code,
                description: "Manual save"
            }
        })

        await prisma.websiteProject.update({
            where: { id: projectId },
            data: {
                current_code: code,
                current_version_index: version.id
            }
        })

        res.json({ message: 'Project saved successfully' });
    } catch (error) {
        console.error("Error saving project:", error);
        res.status(500).json({ error: "Failed to save project" });
    }
};