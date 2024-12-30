import prisma from "@/db";
import { ApiResponse } from "@/lib/ApiResponse";
import { Request, Response } from "express";

export const getAllDocument = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        const documents = await prisma.document.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        collaborators: {
                            some: {
                                userId: userId
                            }
                        }
                    }
                ],
                deletedAt: null
            },
            include: {
                owner: {
                    select: {
                        username: true,
                        email: true
                    }
                },
                collaborators: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json(documents);
        return
    } catch (error) {
        ApiResponse(res, 500, false, "Internal server error");
        return;
    }
}

export const createNewDocument = async (req: Request, res: Response) => {
    try {
        const { title } = req.body;
        const userId = req.userId;
        if (!userId) {
            ApiResponse(res, 400, false, "User ID is required");
            return;
        }

        const document = await prisma.document.create({
            data: {
                title,
                ownerId: userId,
                collaborators: {
                    create: {
                        userId: userId,
                        role: 'OWNER'
                    }
                }
            },
            include: {
                owner: {
                    select: {
                        username: true,
                        email: true
                    }
                },
                collaborators: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        res.status(201).json(document);
        return;
    } catch (error) {
        ApiResponse(res, 500, false, "Internal server error");
        return;
    }
}

export const getDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const document = await prisma.document.findFirst({
            where: {
                id,
                OR: [
                    { ownerId: userId },
                    {
                        collaborators: {
                            some: {
                                userId
                            }
                        }
                    }
                ],
                deletedAt: null
            },
            include: {
                owner: {
                    select: {
                        username: true,
                        email: true
                    }
                },
                collaborators: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true
                            }
                        }
                    }
                },
                version: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.status(201).json(document)
    } catch (error) {
        ApiResponse(res, 500, false, "Internal server error");
        return;
    }
}

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const document = await prisma.document.findFirst({
            where: {
                id,
                ownerId: userId,
                deletedAt: null
            }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found or unauthorized' });
        }

        await prisma.document.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        res.status(200).json({ message: 'Document deleted successfully' });
        return;
    } catch (error) {
        ApiResponse(res, 500, false, "Internal server error")
        return;
    }
}
