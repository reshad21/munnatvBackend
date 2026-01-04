import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';

const create = async (payload: any) => {
  return prisma.contact.create({
    data: {
      ...payload,
      id: payload.id ? String(payload.id) : undefined,
    },
  });
};

const getAll = async (query: Record<string, any>) => {
  const contactQuery = builderQuery({
    searchFields: ['fullName', 'email', 'phone', 'country', 'subject', 'message'],
    searchTerm: query.searchTerm,
    filter: query.filter ? JSON.parse(query.filter) : {},
    orderBy: query.orderBy ? JSON.parse(query.orderBy) : { createdAt: 'desc' },
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
  });

  const totalContacts = await prisma.contact.count({ where: contactQuery.where });
  const currentPage = Number(query.page) || 1;
  const totalPages = Math.ceil(totalContacts / contactQuery.take);

  const response = await prisma.contact.findMany({
    ...contactQuery,
  });

  return {
    meta: {
      totalItems: totalContacts,
      totalPages,
      currentPage,
    },
    data: response,
  };
};

const getById = async (id: string) => {
  return prisma.contact.findUniqueOrThrow({ where: { id } });
};

const deleteContact = async (id: string) => {
  return prisma.contact.delete({ where: { id } });
};

export const ContactService = {
  create,
  getAll,
  getById,
  delete: deleteContact,
};

