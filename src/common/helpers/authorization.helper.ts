import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";

/**
 * 엔티티 소유권 검증 헬퍼 함수
 * @param repository - TypeORM Repository
 * @param entityId - 검증할 엔티티 ID
 * @param userId - 현재 사용자 ID
 * @param entityName - 엔티티 이름 (에러 메시지용)
 * @returns 검증된 엔티티
 * @throws NotFoundException - 엔티티를 찾을 수 없을 때
 * @throws ForbiddenException - 권한이 없을 때
 */
export async function verifyAuthorization<T extends { user: { id: string } }>(
  repository: Repository<T>,
  entityId: string,
  userId: string,
  entityName: string,
): Promise<T> {
  const entity = await repository.findOne({
    where: { id: entityId } as any,
    relations: ["user"],
  });

  if (!entity) {
    throw new NotFoundException(`${entityName}을(를) 찾을 수 없습니다.`);
  }

  if (entity.user.id !== userId) {
    throw new ForbiddenException(`이 ${entityName}에 접근할 권한이 없습니다.`);
  }

  return entity;
}
