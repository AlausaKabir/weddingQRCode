import { Controller, Get, Param, Render } from '@nestjs/common';
import { CustomerService } from '../customer/customer.service';

@Controller('welcome')
export class WelcomeController {
    constructor(private readonly customerService: CustomerService) { }

    @Get(':id')
    @Render('welcome')
    async welcomeCustomer(@Param('id') id: string) {
        const customer = await this.customerService.findById(id);
        if (customer) {
            await this.customerService.markAsPresent(customer._id);
            return { customer };
        }
        return { message: 'Customer not found' };
    }
}
