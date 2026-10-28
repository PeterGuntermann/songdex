using ArchUnitNET.Domain;
using ArchUnitNET.Fluent;
using ArchUnitNET.Loader;
using ArchUnitNET.xUnit;
using Songdex.Backend.Adapter.In.Web;
using Songdex.Backend.Adapter.Out.Persistence;
using Songdex.Backend.Adapter.Out.Persistence.Entities;
using Songdex.Backend.Application;
using Songdex.Backend.Common;
using static ArchUnitNET.Fluent.ArchRuleDefinition;

namespace Songdex.Backend.Architecture.Test;

/// <summary>
/// Guards the hexagonal architecture described in docs/architecture.md on IL level.
/// Project references alone are not enough: attributes such as [MaxLength] come from the BCL and
/// would otherwise be available in the domain model at any time.
/// </summary>
public class HexagonalArchitectureTest
{
    private const string Common = "Songdex.Backend.Common";
    private const string Application = "Songdex.Backend.Application";
    private const string DomainNamespace = "Songdex.Backend.Application.Domain";
    private const string DomainServiceNamespace = "Songdex.Backend.Application.Domain.Service";
    private const string PortNamespace = "Songdex.Backend.Application.Port";
    private const string PortInNamespace = "Songdex.Backend.Application.Port.In";
    private const string PortOutNamespace = "Songdex.Backend.Application.Port.Out";
    private const string Adapter = "Songdex.Backend.Adapter";
    private const string AdapterIn = "Songdex.Backend.Adapter.In";
    private const string AdapterOut = "Songdex.Backend.Adapter.Out";
    private const string Persistence = "Songdex.Backend.Adapter.Out.Persistence";

    private static readonly ArchUnitNET.Domain.Architecture Architecture = new ArchLoader()
        .LoadAssemblies(
            typeof(Result<>).Assembly,
            typeof(ApplicationExtensions).Assembly,
            typeof(WebAdapterExtensions).Assembly,
            typeof(PersistenceAdapterExtensions).Assembly,
            System.Reflection.Assembly.Load("Songdex.Backend.Main"))
        .Build();

    [Fact]
    public void ApplicationDependsOnNoAdapter()
    {
        Types().That().ResideInNamespaceOrBelow(Application)
            .Should().NotDependOnAnyTypesThat().ResideInNamespaceOrBelow(Adapter)
            .Because("the application sits at the centre and does not know its adapters")
            .Check(Architecture);
    }

    [Fact]
    public void DomainIsFreeOfInfrastructureTechnology()
    {
        foreach (var forbidden in new[]
                 {
                     "Microsoft.EntityFrameworkCore",
                     "Microsoft.AspNetCore",
                     "System.ComponentModel.DataAnnotations",
                 })
        {
            Types().That().ResideInNamespaceOrBelow(DomainNamespace)
                .Should().NotDependOnAnyTypesThat().ResideInNamespaceOrBelow(forbidden)
                .Because($"the domain model must not know {forbidden}")
                .Check(Architecture);
        }
    }

    [Fact]
    public void AdaptersDoNotKnowEachOther()
    {
        Types().That().ResideInNamespaceOrBelow(AdapterIn)
            .Should().NotDependOnAnyTypesThat().ResideInNamespaceOrBelow(AdapterOut)
            .Because("the web adapter goes through the application, not straight to persistence")
            .Check(Architecture);

        Types().That().ResideInNamespaceOrBelow(AdapterOut)
            .Should().NotDependOnAnyTypesThat().ResideInNamespaceOrBelow(AdapterIn)
            .Because("persistence knows nothing about its callers")
            .Check(Architecture);
    }

    [Fact]
    public void IncomingAdaptersUseOnlyIncomingPorts()
    {
        Types().That().ResideInNamespaceOrBelow(AdapterIn)
            .Should().NotDependOnAnyTypesThat().ResideInNamespaceOrBelow(PortOutNamespace)
            .Because("outgoing ports belong to the application; incoming adapters use Port.In")
            .Check(Architecture);
    }

    [Fact]
    public void PortsContainOnlyInterfaces()
    {
        Classes().That().ResideInNamespaceOrBelow(PortNamespace)
            .Should().NotExist()
            .Because("Port.In and Port.Out contain interfaces only")
            .Check(Architecture);
    }

    [Fact]
    public void DomainServicesImplementAnIncomingPort()
    {
        Classes().That().ResideInNamespaceOrBelow(DomainServiceNamespace)
            .Should().ImplementAnyInterfacesThat().ResideInNamespaceOrBelow(PortInNamespace)
            .Because("a domain service is only reachable through a use case port")
            .Check(Architecture);
    }

    [Fact]
    public void PersistenceDetailsStayInsideTheirAdapter()
    {
        Types().That().ResideInAssemblyMatching("Songdex\\.Backend\\..*")
            .And().DoNotResideInNamespaceOrBelow(Persistence)
            .Should().NotDependOnAny(typeof(SongdexDbContext), typeof(SongEntity))
            .Because("DbContext and entity are implementation details of the persistence adapter")
            .Check(Architecture);
    }

    [Fact]
    public void CommonDependsOnNothingInsideTheProject()
    {
        Types().That().ResideInNamespaceOrBelow(Common)
            .Should().NotDependOnAnyTypesThat().ResideInNamespaceOrBelow(Application)
            .AndShould().NotDependOnAnyTypesThat().ResideInNamespaceOrBelow(Adapter)
            .Because("Common is infrastructure for everyone and knows nobody")
            .Check(Architecture);
    }
}
