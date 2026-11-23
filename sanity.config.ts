'use client'

/**
 * Sanity Studio configuration, mounted at /studio (see src/app/studio).
 * Access requires signing in with a Sanity account that is a member of the
 * project; manage members at https://www.sanity.io/manage.
 */
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './src/sanity/env'
import { SINGLETON_TYPES, schemaTypes } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

/** Actions allowed on fixed pages: no delete, duplicate or unpublish. */
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'kfrailey',
  title: 'Kristen Frailey Fine Art',
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    // Pages and galleries exist once; hide them from "Create new".
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : actions,
    newDocumentOptions: (items, { creationContext }) =>
      creationContext.type === 'global'
        ? items.filter((item) => !SINGLETON_TYPES.has(item.templateId))
        : items,
  },
  apiVersion,
})
