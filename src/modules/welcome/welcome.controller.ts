import { Controller, Get, Param, Render } from '@nestjs/common';
import { GuestService } from '../guest/guest.service';

@Controller('welcome')
export class WelcomeController {
    constructor(private readonly guestService: GuestService) { }

    @Get(':id')
    @Render('welcome')
    async welcomeGuest(@Param('id') id: string) {
        const guest = await this.guestService.findById(id);
        if (guest) {
            await this.guestService.markAsPresent(guest._id);
            return { guest };
        }
        return { message: 'Guest not found' };
    }
}
