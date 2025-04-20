import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/commons/dto/Pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connetected');
  }
  async create(createProductDto: CreateProductDto) {
    return await this.product.create({ data: createProductDto });
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;
    const count = await this.product.count({
      where: { available: true },
    });
    const data = await this.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { available: true },
    });

    return {
      data,
      metadata: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number) {
    const result = await this.product.findUnique({
      where: { id, available: true },
    });
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return result;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto;
    await this.findOne(id);
    return await this.product.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    //return this.product.delete({ where: { id } });
    return await this.product.update({
      where: { id },
      data: { available: false },
    });
  }
}
