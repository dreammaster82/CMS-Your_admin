# CMS-Your_admin
CMS система "Ваша админка"

**Для работы необходима база с поддержкой json форматов (например MySql 5.7)**

Подготовка к работе:
1. Для настройки подключения, создать файл env.json в папке ./config (можно из env.test.json),
либо добавить необходимые настройки в переменные окружения системы
2. В переменные окружения добавить **appId** (id приложения для авторизации) и **appSecret** (секретное слово для авторизации),
3. Для работы фронтендной части необходимо указать **restApi** (путь до рест сервера): окружении или в ./admin/package.json при сборке
4. Перед запуском необходимо выполнить команду **node migrate.js migrate** для начального создания базы.

Сборка админки из папки **./admin**

Запуск сервера командой **npm start**