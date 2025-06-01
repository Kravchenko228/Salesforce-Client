import { Routes } from '@angular/router';
import { ContactList } from './pages/contact-list/contact-list';

export const routes: Routes = [
    {
        path: '',
        component: ContactList,
        title: 'Contact List',
    }

];
