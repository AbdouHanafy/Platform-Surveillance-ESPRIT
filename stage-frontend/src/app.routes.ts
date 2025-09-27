import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { UserComponent } from './app/Component/user/user.component';
import { ResetPasswordComponent } from './app/Component/reset-password/reset-password.component';
import { DashboardAdminComponent } from './app/Component/dashboard-admin/dashboard-admin.component';
import { DashboardSuperadminComponent } from './app/Component/dashboard-superadmin/dashboard-superadmin.component';
import { DashboardEnseignantComponent } from './app/Component/dashboard-enseignant/dashboard-enseignant.component';
import { LoginComponent } from './app/Component/login/login/login.component';
import { RegisterComponent } from './app/Component/user/register/register.component';
import { EnseignantComponent } from './app/Component/Enseignant/enseignant/enseignant.component';
import { AddEnseignantComponent } from './app/Component/Enseignant/add-enseignant/add-enseignant.component';
import { AddEmploiDuTempComponent } from './app/Component/Enseignant/add-emploi-du-temp/add-emploi-du-temp.component';
import { EmploiDuTempComponent } from './app/Component/Enseignant/emploi-du-temp/emploi-du-temp.component';
import { SalleComponnentComponent } from './app/Component/Salle/salle-componnent/salle-componnent.component';
import { CalendrierEmploiComponentComponent } from './app/Component/Enseignant/calendrier-emploi-component/calendrier-emploi-component.component';
import { CalendrierSurveillanceComponent } from './app/Component/Enseignant/calendrier-surveillance/calendrier-surveillance.component';
import { AddCalendrierSurveillanceComponent } from './app/Component/Enseignant/add-calendrier-surveillance/add-calendrier-surveillance.component';
import { EmploiTempsFiltreComponent } from './app/Component/Enseignant/emploi-temps-filtre/emploi-temps-filtre.component';
import { UpdateUserComponent } from './app/Component/user/update/update-user/update-user.component';
import { UpdateEnseignantComponent } from './app/Component/Enseignant/update-enseignant/update-enseignant.component';
import { ModulesComponent } from './app/Component/modules/modules.component';
import { SessionManagerComponent } from './app/Component/session-manager/session-manager.component';
import { ModuleManagerComponent } from './app/Component/module-manager/module-manager.component';
import { GroupeManagerComponent } from './app/Component/groupe-manager/groupe-manager.component';
import { AffectationComponent } from './app/Component/affectation/affectation.component';
import { AffectationModuleCalendarComponent } from './app/Component/affectation-module-calendar/affectation-module-calendar.component';
import { AffectationSalleAutoComponent } from './app/Component/affectation-salle-auto/affectation-salle-auto.component';
import { AffectationEnseignantAutoComponent } from './app/Component/affectation-enseignant-auto/affectation-enseignant-auto.component';
import { GestionExamenComponent } from './app/Component/gestion-examen/gestion-examen.component';
import { ExamenChronoComponent } from './app/Component/examen-chrono/examen-chrono.component';
import { FraudeComponent } from './app/Component/fraude/fraude.component';

export const appRoutes: Routes = [
    {
    path: '',
    component: AppLayout,
    children: [
        { path: 'users', component: UserComponent },
        { path: 'enseignants', component: EnseignantComponent },
        {path: 'addenseignant',component: AddEnseignantComponent},
        {path: 'update-enseignant/:id', component: UpdateEnseignantComponent},
        {path: 'modules', component: ModulesComponent},
        {path: 'addCalendrier/:id',component: AddEmploiDuTempComponent},
        {path: 'calendrier',component: EmploiDuTempComponent},
        {path: 'Calendrier_enseignant/:id',component: CalendrierEmploiComponentComponent},
        {path: 'Surveillance',component: CalendrierSurveillanceComponent},
        {path: 'add-surveillance/:id',component: AddCalendrierSurveillanceComponent},
        {path:'session',component: SessionManagerComponent},
        {path:'module_manger',component: ModuleManagerComponent},
        {path:'groupe_manager',component: GroupeManagerComponent},
         {path:'AffectationClasse',component:AffectationComponent},
         {path:'affectation',component:AffectationComponent},
         {path:'affectation-module-calendar',component:AffectationModuleCalendarComponent},
         {path:'affectation-salle-auto',component:AffectationSalleAutoComponent},
         {path:'affectation-enseignant-auto',component:AffectationEnseignantAutoComponent},
         {path: 'GestionExamen', component: GestionExamenComponent},    
        {path: 'examanchreno', component: ExamenChronoComponent}, 

        { path: 'fraudes', component: FraudeComponent },
        {path: 'calendrier-filtre',component: EmploiTempsFiltreComponent},

         
        { path: 'salles', component: SalleComponnentComponent },
        { path: 'login', component: LoginComponent , data: { hideLayout: true }},
        { path: '', component: LoginComponent , data: { hideLayout: true }},
         { path: 'register', component: RegisterComponent },
         {path: 'update-user/:id', component: UpdateUserComponent},
        { path: 'reset-password', component: ResetPasswordComponent, data: { hideLayout: true } },
        { path: 'dashboard-admin', component: DashboardAdminComponent },
        { path: 'dashboard-superadmin', component: DashboardSuperadminComponent },
        { path: 'dashboard-enseignant', component: DashboardEnseignantComponent },
        { path: 'dashbord', component: Dashboard },
        
        { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
        { path: 'documentation', component: Documentation },
        { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },



        
    ]
},

    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
    
];
