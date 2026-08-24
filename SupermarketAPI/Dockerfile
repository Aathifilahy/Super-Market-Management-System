FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["SupermarketAPI/SupermarketAPI.csproj", "SupermarketAPI/"]
RUN dotnet restore "SupermarketAPI/SupermarketAPI.csproj"
COPY . .
WORKDIR "/src/SupermarketAPI"
RUN dotnet publish "SupermarketAPI.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 10000
ENV ASPNETCORE_URLS=http://+:10000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SupermarketAPI.dll"]
