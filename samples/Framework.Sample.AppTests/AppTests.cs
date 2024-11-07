using FluentAssertions;
using FluentAssertions.Equivalency;
using Framework.Sample.App;
using Framework.Sample.App.Payloads;
using Framework.Sample.AppTests.Helpers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;
using TCPOS.AspNetCore.DataBind.Batch.Enums;
using TCPOS.AspNetCore.DataBind.Payloads;
using Xunit;

namespace Framework.Sample.AppTests;

public class AppTests : IDisposable, IAsyncDisposable
{
    private readonly HttpClient _httpClient;
    private readonly WebApplication _webApplication;

    public AppTests()
    {
        _webApplication = WebApplicationFactory.Create(Array.Empty<string>(), new App.WebApplicationFactoryOptions(true)).Result;
        _webApplication.Start();
        _httpClient = _webApplication.GetTestClient();
    }

    public async ValueTask DisposeAsync()
    {
        await _webApplication.DisposeAsync();
        _httpClient.Dispose();
    }

    public void Dispose()
    {
        ((IDisposable)_webApplication).Dispose();
        _httpClient.Dispose();
    }


    [Fact]
    public async Task BatchCreateShouldWork()
    {
        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>($"/api/1.0/Customer",  System.Net.HttpStatusCode.OK);
        foreach (var customer in customers)
        {
            await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{customer.Id}", System.Net.HttpStatusCode.OK);
        }

        var customerIn = new CustomerIn()
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        await _httpClient. RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Insert}", customerIn, System.Net.HttpStatusCode.Created);
        });

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>($"/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, System.Net.HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        customerIn = new CustomerIn()
        {
            FirstName = "Mario",
            LastName = "Bianchi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{customers.First().Id}/{Operations.Replace}", customerIn, System.Net.HttpStatusCode.Created);
        });

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>($"/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, System.Net.HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{customers.First().Id}/{Operations.Remove}", customerIn, System.Net.HttpStatusCode.Created);
        });

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>($"/api/1.0/Customer",  System.Net.HttpStatusCode.OK);
        customers.Should().HaveCount(0);
    }


    [Fact]
    public async Task BatchCreateShouldWork1()
    {
        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>($"/api/1.0/Customer", System.Net.HttpStatusCode.OK);
        foreach (var customer in customers)
        {
            await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{customer.Id}", System.Net.HttpStatusCode.OK);
        }
        var customerIn = new CustomerIn()
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Insert}", customerIn, System.Net.HttpStatusCode.Created);
        });

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>($"/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, System.Net.HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        var orderIn = new OrderIn<ValueReference>()
        {
            CustomerId = ValueReference.CreateValue(customers.First().Id),
            Notes = "Test",
            OrderDate = DateOnly.FromDateTime( DateTime.Now)
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<OrderIn<ValueReference>, string>($"/api/1.0/Batch/{batchId}/1/Order/{Operations.Insert}", orderIn, System.Net.HttpStatusCode.Created);
        });
    }

}