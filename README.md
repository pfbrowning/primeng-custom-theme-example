# Creating a custom PrimeNG SCSS theme

PrimeNG is a capable open source Angular UI library which provides a large number of useful components.  There are plenty of premium themes available for PrimeNG, some of which do look rather nice.  They also offer a commercial theme designer product.  However, for those of us who wish to take the free, open-source route, the options are limited, which is ironic considering that the library itself is under the MIT license.  At the time of writing there are only a handful of free themes offered with PrimeNG, which themselves are really just different variations on the same two core free themes ("Nova" and "Luna").  They used to have many more free themes, but they were recently deprecated (although they're still available on Github and in the NPM package).

Writing your own theme via SCSS is not difficult once you figure out how it works, but at the time of writing there's no official documentation whatsoever on the subject and not much in the way of unofficial documentation.  I found [this](https://medium.com/@OlegVaraksin/simple-ways-to-create-a-new-theme-in-primeng-12d9bbe3fc60) guide to be very helpful, but a lot has changed since that post was written.  1 1/2 years is a long time in the world of cutting edge web development.

This tutorial uses Angular 7 and assumes that you're using at least Angular 6.  You can probably follow along with earlier versions of Angular if you haven't upgraded yet: YMMV.

# 1 - Create Your App & Import PrimeNG
First we have to handle the boring boilerplate of creating our example app and adding PrimeNG to it.  If you already have a working Angular app with PrimeNG added, then feel free to skip to step 3.

First create your app with `ng new primeng-custom-theme-example`.  If you're using Angular CLI 7, it will prompt you about routing and stylesheets.  This tutorial will work regardless of which you select.  Angular CLI will compile SCSS files for you when you specify them as app styles or component styles even if you didn't create your app with the SCSS option.  In order to demonstrate this I'm going to select CSS stylesheets.

Install PrimeNG with `npm i primeng primeicons --save`.  Add references to PrimeNG's primeicons.css, nova-light theme.css, and primeng.min.css within the 'styles' array in your Angular.json.  Adding the nova-light theme file is a temporary measure just so that the app displays properly until we replace it with our own theme stylesheet.
```json
"styles": [
    "src/styles.css",
    "node_modules/primeicons/primeicons.css",
    "node_modules/primeng/resources/themes/nova-light/theme.css",
    "node_modules/primeng/resources/primeng.min.css"
],
```

# 2 - Add a few example components
For the purpose of checking out how each component looks at first with the default style and then with our own style by comparison, we'll add a few basic PrimeNG components to our App Component.  We don't need to wire up any specific functionality: we just want to see how they look.

First we'll import the BrowserAnimationsModule (required for any PrimeNG component), ButtonModule, FileUploadModule, and ToastModule, and then configure a provider for MessageService (used for the toaster notification component).  Our app.module should look like this:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```
Then we'll add a few different buttons: one each for PrimeNG's 'primary' and 'secondary' colors, and one for each of PrimeNG's button severity levels.  We'll also add a file multiselect and a toaster notification.  Lastly we'll add click handlers to each button, including the severity level for the severity buttons.  These will be used to show toast notifications of various severities.
```html
<h2>Severity Buttons</h2>
<div class="severity-buttons">
  <button pButton type="button" label="Primary" (click)="onClick()"></button>
  <button pButton type="button" label="Secondary" (click)="onClick()" class="ui-button-secondary"></button>
  <button pButton type="button" label="Success" (click)="onClick('success')" class="ui-button-success"></button>
  <button pButton type="button" label="Info" (click)="onClick('info')" class="ui-button-info"></button>
  <button pButton type="button" label="Warning" (click)="onClick('warn')" class="ui-button-warning"></button>
  <button pButton type="button" label="Danger" (click)="onClick('error')" class="ui-button-danger"></button>
</div>
<h2>Demo Upload</h2>
<p-fileUpload multiple="multiple"></p-fileUpload>
<p-toast></p-toast>
```
We'll add a few pixels of margin between the buttons so that they don't all run together
```css
.severity-buttons button {
    margin:5px;
}
```
Lastly we'll inject the MessageService into the app component and add a click handler which shows a toaster notification
denoting the severity of the button clicked.  The toaster is styled differently based on the severity of the provided
message object, and we'll also show the severity in the summary.  For clicks which didn't provide a severity (by the
Primary and Secondary buttons) we'll default to 'success' because there is no associated severity.
```typescript
  constructor(private messageService: MessageService) {}

  public onClick(severity: string = 'success') {
    this.messageService.add({severity:severity, summary:severity, detail:'You clicked a button!'});
  }
```
At this point we can observe these basic components with the included default nova-light theme:
![Free Theme Demo](https://raw.githubusercontent.com/pfbrowning/primeng-custom-theme-example/master/src/assets/media/free-theme-demo.gif)
# 3 - Understanding The Structure Of The Bundled PrimeNG Free Theme
At this point it's a good idea to look through the 'node_modules/primeng/resources/themes' folder to get a feel for how the deprecated free themes are arranged.  There's a folder for each theme, and while the contents vary from theme to theme, most of them contain a 'theme.scss' file.  If you take a look at those 'theme.scss' files, you'll see that they declare theme-specific SCSS variables for things like colors, border widths, etc, for different component states (default, focus, highlight, error, etc).  Some include fonts and images, which are also referenced in the 'theme.scss' file.  At the end they import the '_theme.css' file at the root of the themes folder, which contains the global PrimeNG SCSS rules.  That underscore is important: from here on we'll call the '_theme.css' the global SCSS rule file and we'll refer to the theme-specific 'theme.scss' as the theme variables file.  We will be following the same pattern here: we'll be creating our own theme variable file, then importing the global PrimeNG SCSS rules, then applying any rules of our own.

Note also the fact that, for all of the free themes except for Nova and Luna, as well as for the global PrimeNG SCSS rule file, there's a comment at the beginning of the file stating that the theme is deprecated, and that we should use Nova instead.  The folders for the Nova and Luna themes contain the compiled CSS, rather than theme variables files to go along with the global rules.  From this we can infer that an actively maintained global rules file does exist somewhere (the Nova theme was presumably compiled with it), but it's no longer open source (presumably to encourage people to buy their premium themes).  We can live with the theme variable files being deprecated, but the fact that the global PrimeNG SCSS rule file is deprecated is problematic for us.  This means that as PrimeNG implements new components and makes breaking changes to their CSS in the future, we will have to adapt accordingly by adding and modifying rules as necessary.  In my view, this is a tradeoff: the flexibility that I get from maintaining my own themes outweighs the inconvenience of having to add and modify the SCSS occasionally.  If you agree with that tradeoff, then read on.
# 4 - Importing A Free Theme To Modify
Now that we understand the layout of the bundled, now-deprecated free themes, the path forward is clear: we'll just take one of the theme variable files, modify the variables to our liking, add any extra necessary rules, and tell Angular CLI to use our custom theme file rather than the bundled PrimeNG theme.  For the purposes of our demo I'm going to reuse one of the simpler free themes (one which references no external assets), but the process should be similar for any of the free themes as long as it contains a theme.scss file (rather than compiled CSS only, as with Nova and Luna).

1. Create a new folder entitled 'primeng-theme' within 'src/assets'
2. Copy the Cruze variables file ('cruze/theme.scss') and the global PrimeNG rules file ('_theme.scss') within 'node_modules/primeng/resources/themes' to our new 'src/primeng-theme' folder.  To clarify the difference between the two, rename '_theme.scss' to 'primeng-rules.scss'.  Update the corresponding import at the bottom of "theme.scss" accordingly so that it reads "@import './primeng-rules.scss';".
3. Include the imported theme by replacing the nova-light 'theme.css' with our newly imported 'theme.scss' in the styles array within Angular.json.
In the olden days we would have had to manually recompile our theme with each change, but luckily Angular CLI handles that for us so we don't have to
worry about it.
```json
"styles": [
  "src/styles.css",
  "src/primeng-theme/theme.scss",
  "node_modules/primeicons/primeicons.css",
  "node_modules/primeng/resources/primeng.min.css"
],
```
4. Now that we've got everything set up modify our imported free theme, let's boot up the app and see how it looks as-is before we start changing things.

![Free Theme Compiled Demo](https://raw.githubusercontent.com/pfbrowning/primeng-custom-theme-example/master/src/assets/media/free-theme-compiled-demo.gif)

# 5 - Modifying the free theme to our liking
Based on our simple demo, we already see a few problems which we can fix with a bit of ingenuity.
1. There doesn't seem to be any concept of severity colors here.  The severity buttons all use the regular button color and the toaster notifications are all white.  We will add our own SCSS variables for each severity color and then apply them to custom rules for each button severity class and toaster severity class.
2. The header bleeds through beneath the toaster notification.  This will be resolved by the severity background color rules which we're applying as per the previous note.
3. The primary and secondary buttons are the same color.  We'll resolve this by adding a SCSS variable for secondary color and a custom rule to apply this color to the secondary button class.
4. The toaster's 'close' button is blue and underlined, but we want it to be black and not underlined.  We'll add a custom rule to fix this as well.

It's not immediately clear why the free theme doesn't handle these things properly.  These are pretty glaring oversights, so I'm assuming that these are just new features which were introduced after or around the same time as the deprecation of the free themes.  With this in mind we can assume that we'll probably have to make similar adjustments for new features in the future.

In addition I'm going to change some of the existing variables by borrowing them from other free themes and setting a few custom values myself.

The updated theme file is too long to include in a code block, so I'm linking it [here](https://github.com/pfbrowning/primeng-custom-theme-example/blob/master/src/primeng-theme/theme.scss).

Now that we've got our custom theme put together, let's compiled it and run our demo app again:
![Custom Theme Demo](https://raw.githubusercontent.com/pfbrowning/primeng-custom-theme-example/master/src/assets/media/custom-theme-demo.gif)

This is much better than before.  It's not perfect, but it's a good starting point.  From here you can customize and re-compile the theme to your heart's content until it's perfect for your needs.

TODO update to account for SCSS projects
TODO general proofreading & editing
TODO move markdown to Wordpress