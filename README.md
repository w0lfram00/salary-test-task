# Test task - Salary calculation and employee hierarchy management

## Set up

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

Set up .env file

```bash
PORT=
DATABASE_URL=
```

## For review

```bash
npm run start
```

or

```bash
npm run test
```

## Notes

- Whole application is made within one module, though it could split in 2-3.
- Constants file was created for swift change of base salaries. Some other constants could be added here like subs influence percentage...
- Base salaries are set up in constants/index.ts and accounted for all salary tests. Modifying base salaries will break all salary tests as I don't see the reason for automating that for this task purposes.
- Salary calculating function is recursive. There for it can calculate long chains of employees' salaries with small amount of code written.
- Salary isn't the cheapest operation to do, so it would be reasonable to store calculated salary of every worker. But it would require coming up with solution for updating it effectively when management changes or a person gets a raise. Maybe it is not so bad as I imagine and can be done easily with SQL triggered function. For purposes of this test task it wasn't implemented. Ultimately best solution depends on not yet specified requirement.
- This app doesn't have a swagger, but, once again, don't see the reason to implement for this task.
- It only works on localhost as CORS isn't set up for this project

- For future adoption to some platform. This app should get an auth module and protect sensitive and confidential routes. Though i don't think that salary would be confidential information in this company as everyone elses pay depends on each others.
- In case of future possibility of employees having multiple managers, this app will be totally outdated
