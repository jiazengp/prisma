import { expectTypeOf } from 'expect-type'

import testMatrix from './_matrix'
// @ts-ignore
import type { PrismaClient } from './generated/prisma/client'
// @ts-ignore
import * as Sql from './generated/prisma/sql'

declare let prisma: PrismaClient
declare let sql: typeof Sql

testMatrix.setupTestSuite(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ generatorType }) => {
    beforeAll(async () => {
      await prisma.user.create({
        data: {
          role: 'ADMIN',
          favoriteAnimal: 'STEVE',
        },
      })
    })

    test('returns enums that are mapped to invalid JS identifier correctly', async () => {
      const result = await prisma.$queryRawTyped(sql.getUser())
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "favoriteAnimal": "STEVE",
            "role": "ADMIN",
          },
        ]
      `)

      expectTypeOf(result[0].favoriteAnimal).toEqualTypeOf<'CAT' | 'DOG' | 'STEVE'>()
      // @ts-test-if: generatorType !== 'prisma-client-ts'
      expectTypeOf(result[0].favoriteAnimal).toEqualTypeOf<Sql.$DbEnums.Animal>()
      // @ts-test-if: generatorType === 'prisma-client-ts'
      expectTypeOf(result[0].favoriteAnimal).toEqualTypeOf<Sql.$DbEnums['Animal']>()

      expectTypeOf(result[0].role).toEqualTypeOf<'ADMIN' | 'USER'>()
      expectTypeOf(result[0].role).toEqualTypeOf<Sql.$DbEnums['user-role']>()
    })
  },
  {
    optOut: {
      from: ['sqlite', 'mysql', 'mongodb', 'sqlserver'],
      reason: 'Test need both enums and typed-sql support',
    },
  },
)
