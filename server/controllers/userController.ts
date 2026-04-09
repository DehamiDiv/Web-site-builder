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

//Get user credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
       const userId = req.userId;
       if(!userId){
        return res.status(401).json({ error: "Unauthorized user" });
       }
       const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
       })
       if(!user){
        return res.status(404).json({ error: "User not found" });
       }
       res.status(200).json({ credits: user.credits });
    } catch (error) {
        console.error("Error fetching user credits:", error);
        res.status(500).json({ error: "Failed to fetch user credits" });
    }
};

//Controller function to create New Project
export const createNewProject = async (req: Request, res: Response) => {
    const userId = req.userId;
    
    try {
        const { initial_prompt } = req.body;
       if(!userId){
        return res.status(401).json({ error: "Unauthorized user" });
       }
       const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
       })
       if(!user){
        return res.status(404).json({ error: "User not found" });
       }
       if(user && user.credits < 5){
        return res.status(400).json({ error: "Insufficient credits" });
       }
       //Create new project
       const project = await prisma.websiteProject.create({
        data: {
            name: initial_prompt.length > 50 ? initial_prompt.substring(0, 47) + "..." : initial_prompt,
            initial_prompt: initial_prompt,
            userId
        }
       })
       //Update User's Total Creation
       await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            totalCreation: user.totalCreation + 1
        }
       })
       await prisma.conversation.create({
        data: {
            role: "user",
            content: initial_prompt,
            projectId: project.id
        }
       })

       await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            credits: user.credits - 5
        }
       })
       res.json({projectId: project.id})

       //Enhance user prompt
       const promptEnhancementResponse = await openai.chat.completions.create({
        model: "openai/gpt-oss-120b:free",
        messages: [
            {
                role: "system",
                content:`You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

    Enhance this prompt by:
    1. Adding specific design details (layout, color scheme, typography)
    2. Specifying key sections and features
    3. Describing the user experience and interactions
    4. Including modern web design best practices
    5. Mentioning responsive design requirements
    6. Adding any missing but important elements

Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).
`
            },
            {
                role: "user",
                content: initial_prompt
            }
        ]
       })
       const enhancedPrompt = promptEnhancementResponse.choices[0].message.content;
       await prisma.conversation.create({
        data: {
            role: "assistant",
            content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
            projectId: project.id
            
        }
       })
       await prisma.conversation.create({
        data: {
            role: "assistant",
            content: 'Now generating your website...',
            projectId: project.id
            
        }
       })

//Generate website code
const codeGenerationResponse = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b:free",
    messages: [
        {
            role: "system",
            content: `You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

    CRITICAL REQUIREMENTS:
    - You MUST output valid HTML ONLY. 
    - Use Tailwind CSS for ALL styling
    - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    - Use Tailwind utility classes extensively for styling, animations, and responsiveness
    - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
    - Use modern, beautiful design with great UX using Tailwind classes
    - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
    - Use Tailwind animations and transitions (animate-*, transition-*)
    - Include all necessary meta tags
    - Use Google Fonts CDN if needed for custom fonts
    - Use placeholder images from https://placehold.co/600x400
    - Use Tailwind gradient classes for beautiful backgrounds
    - Make sure all buttons, cards, and components use Tailwind styling

    CRITICAL HARD RULES:
    1. You MUST put ALL output ONLY into message.content.
    2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
    3. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
    4. Do NOT include markdown, explanations, notes, or code fences.

    The HTML should be complete and ready to render as-is with Tailwind CSS.
`
        },
        {
            role: "user",
            content: enhancedPrompt || ''
        }
    ]
})
 const codeRaw = codeGenerationResponse.choices[0].message.content || '';
 console.log("--- RAW AI RESPONSE START (createNewProject) ---");
 console.log(codeRaw);
 console.log("--- RAW AI RESPONSE END ---");

 const code = extractHTML(codeRaw);
 
 if(!code || code.trim() === ''){
     console.log("Error: Extracted code is empty.");
     await prisma.conversation.create({
    data: {
        role: "assistant",
        content: "Unable to generate website code. Please try again.",
        projectId: project.id,
        
    }
 })
 if (userId) {
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    credits:{increment: 5}
                }
            })
        }
        return res.status(500).json({ error: "Failed to generate website code" });
 }

 //Create version for the project
 const version = await prisma.version.create({
    data: {
        projectId: project.id,
        code: code,
        description: "Initial version"
    }
 })

 await prisma.conversation.create({
    data: {
        role: "assistant",
        content: "I've created your website! You can now preview it and request any changes.",
        projectId: project.id,
        
    }
 })

 await prisma.websiteProject.update({
    where: {
        id: project.id
    },
    data: {
        current_code: code,
        current_version_index: version.id,
        
    }
 })
       
    } catch (error:any) {
        if (userId) {
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    credits:{increment: 5}
                }
            })
        }
        console.error("Error creating project:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to create project" });
        }
     }
};

//Controller function to get a single user project
export const getUserProject = async (req: Request, res: Response) => {
    try {
       const userId = req.userId;
       if(!userId){
        return res.status(401).json({ error: "Unauthorized user" });
       }
       const projectId = req.params.projectId as string;
       const project = await prisma.websiteProject.findUnique({
        where: {
            id: projectId,userId
        },
        include: {
            conversation: {orderBy: {timestamp: "asc"}},
            versions: {orderBy: {timestamp: "asc"}}
        }
       })
      
       res.status(200).json({ project });
    } catch (error) {
        console.error("Error fetching user project:", error);
        res.status(500).json({ error: "Failed to fetch user project" });
    }
};


//Controller function to get all user projects
export const getUserProjects = async (req: Request, res: Response) => {
    try {
       const userId = req.userId;
       if(!userId){
        return res.status(401).json({ error: "Unauthorized user" });
       }
       const projects = await prisma.websiteProject.findMany({
        where: {
            userId
        },
       orderBy: {updatedAt: 'desc'}
       })
      
       res.status(200).json({ projects });
    } catch (error) {
        console.error("Error fetching user projects:", error);
        res.status(500).json({ error: "Failed to fetch user projects" });
    }
};


//controller function to toggle project publish status
export const togglePublish = async (req: Request, res: Response) => {
    try {
       const userId = req.userId;
       if(!userId){
        return res.status(401).json({ error: "Unauthorized user" });
       }
       const projectId = req.params.projectId as string;
       const project = await prisma.websiteProject.findUnique({
        where: {
            id: projectId,userId
        },
       })
       if(!project){
        return res.status(404).json({ error: "Project not found" });
       }
       const updated = await prisma.websiteProject.update({
        where: {
            id: projectId
        },
        data: {
            isPublished: !project.isPublished
        }
       })
       res.status(200).json({
           message: updated.isPublished ? 'Project Published Successfully' : 'Project Unpublished',
           isPublished: updated.isPublished
       });
    } catch (error) {
        console.error("Error toggling publish status:", error);
        res.status(500).json({ error: "Failed to toggle publish status" });
    }
};


// Controller function to purchase credits
export const purchaseCredits = async (req: Request, res: Response) => {
    try {
        interface Plan {
            credits:number;
            amount:number;
        }
        const Plans ={
            basic: {credits: 100,amount:5},
            pro: {credits: 400, amount: 19},
            enterprise: {credits: 1000, amount:49},
        }
        const userId = req.userId;
        const {planId} = req.body as {planId: keyof typeof plans}

        const plan:Plan = plans[planId]
        if(!plan){
            return res.status(404).json({message: 'Plan not found'})
        }
        const transaction = await prisma.transaction.create({
            data: {
                userId: userId!,
                planId: req.body.planId,
                amount: plan.amount,
                credits: plan.credits

            }
        })
    } catch (error) {
        console.error("Error purchasing credits:", error);
        res.status(500).json({ error: "Failed to purchase credits" });
    }
};