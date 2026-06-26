#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(){
// 1. Foydalanuvchidan o'z ismini va familiyasini kiriting. 
// Ism va familiyani tekshiring. Agar ikkalasi ham faqat harflardan 
// iborat bo'lsa, ularni kattalashgan holda birlashtirib chiqarib bering.

// char ism[50]="", familiya[50]="", full_name[50]="";

// printf("Ism: ");
// scanf("%s", ism);

// printf("Familiya: ");
// scanf("%s", familiya);

// for(int i=0; ism[i]; i++){
//     char ism2;
//         ism2=toupper(ism[i]);
//         ism[i]=ism2;
//     if(!isalpha(ism[i])){
        
//         return 0;
//     }
// }

// for(int i=0; familiya[i]; i++){
//     char c;
//     c=toupper(familiya[i]);
//     familiya[i]=c;
//     if(!isalpha(familiya[i])){
//         return 0;
//     }
// }


// strcat(full_name, ism);
// strcat(full_name, " ");
// strcat(full_name, familiya);

// puts(full_name);

// -------------------------------------------------------

// 2. Foydalanuvchidan aralash belgilar va raqamlardan iborat satrni 
// kiritishni so'rang. Raqamlar va harflarni alohida ajratib, harflar 
// sonini va raqamlar sonini hisoblang. Keyin har bir belgi uchun uning 
// turini aniqlab, natijani chiqarib bering.

// char satr[100];

// printf("satirni kiriting: ");
// scanf("%s", satr);

// int raqam=0, harf=0;

// for(int i=0; satr[i]; i++){
//     if(satr[i]>=48 && satr[i]<=57){
//         raqam++;
//         printf("%c - raqam\n", satr[i]);
//     }else if(satr[i]>=65 && satr[i]<=90 || satr[i]>=97 && satr[i]<=122){
//         harf++;
//         printf("%c - harf\n",satr[i]);
//     }
// }

// printf("raqamlar soni: %d\n", raqam);
// printf("harflar soni: %d",harf);

// -------------------------------------------------------

// 3. Foydalanuvchidan satrni kiritishini so'rang. Satrni o'qib oling va 
// uni to'liq kichik harflarga va to'liq katta harflarga o'zgartiring. 
// Natijalarni ko'rsating va ularning uzunligini hisoblang.

// char satr[100];

// printf("satrni kiriting: ");
// scanf("%[^\n]",satr);
// int kichik=0, katta=0;

// for(int i=0; satr[i]; i++){
//     char c;
//     c=tolower(satr[i]);
//     satr[i]=c;
//     kichik++;
// }
// printf("kichik harf: %s\n",satr);

// for(int i=0; satr[i]; i++){
//     char c;
//     c=toupper(satr[i]);
//     satr[i]=c;
//     katta++;
// }
// printf("katta harf: %s\n",satr);
// printf("kichik harflar uzunligi: %d\n",kichik);
// printf("katta harflar uzunligi: %d", katta);

// -------------------------------------------------------

// 4. Foydalanuvchidan ikkita satr kiritishini so'rang. Agar satrlar 
// bir xil bo'lsa, ularni birlashtirib, yangi satrni chiqarib bering. 
// Agar satrlar turlicha bo'lsa, har bir satrning uzunligini va alohida 
// bo'shliq belgilarini hisoblang.

// char satr1[50]="", satr2[50]="", full_satr[50];
// int satr1_i=0, satr2_i=0;

// printf("birinchi satirni kiriting: ");
// scanf("%s", satr1);

// printf("ikkinchi satrni kiriting: ");
// scanf("%s", satr2);

// for(int i=0; satr1[i]; i++){
    
//     if(satr1[i]=satr2[i]){
//         puts();
//     }
// }



// -------------------------------------------------------

// 5. Foydalanuvchidan satrni kiritishni so'rang. Satrdagi bo'shliq 
// belgilarini olib tashlang va har bir harfni puts yordamida alohida 
// chiqarib bering. Shuningdek, har bir harfni katta harfga o'zgartiring.

// char satr[100];
// printf("satrni kiriting: ");
// scanf("%[^\n]",satr);

// for(int i=0; satr[i]; i++){
//     if(isalpha(satr[i])){
//         char a;
//         a=toupper(satr[i]);
//         printf("%c",a);
//         puts("");
//     }
// }

}
