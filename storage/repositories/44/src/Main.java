import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import org.hibernate.cfg.Configuration;
import org.hibernate.SessionFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Entity
@Table(name = "transactions")
class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String symbol;
    @Column(nullable = false)
    private String type;
    @Column(nullable = false)
    private Double quantity;
    @Column(nullable = false)
    private Double price;
    @Column(nullable = false)
    private LocalDateTime tradeDate;

    public Transaction() {}

    public Transaction(String symbol, String type, Double quantity, Double price, LocalDateTime tradeDate) {
        this.symbol = symbol;
        this.type = type;
        this.quantity = quantity;
        this.price = price;
        this.tradeDate = tradeDate;
    }

    public Long getId() { return id; }
    public String getSymbol() { return symbol; }
    public String getType() { return type; }
    public Double getQuantity() { return quantity; }
    public Double getPrice() { return price; }
    public LocalDateTime getTradeDate() { return tradeDate; }

    @Override
    public String toString() {
        return String.format("Transaction{id=%d, symbol='%s', type='%s', qty=%.2f, price=%.2f, date=%s}",
                id, symbol, type, quantity, price, tradeDate);
    }
}

class TransactionDao {
    public void save(Transaction transaction) {
        EntityManager em = JpaUtil.getEntityManager();
        em.getTransaction().begin();
        em.persist(transaction);
        em.getTransaction().commit();
        em.close();
    }

    public List<Transaction> findAll() {
        EntityManager em = JpaUtil.getEntityManager();
        List<Transaction> list = em.createQuery("from Transaction", Transaction.class).getResultList();
        em.close();
        return list;
    }

    public List<String> findDistinctSymbols() {
        EntityManager em = JpaUtil.getEntityManager();
        TypedQuery<String> query = em.createQuery("SELECT DISTINCT t.symbol FROM Transaction t", String.class);
        List<String> result = query.getResultList();
        em.close();
        return result;
    }
}

class AlphaVantageClient {
    private static final String API_KEY = "demo";
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public Double fetchCurrentPrice(String symbol) {
        String url = String.format(
                "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=%s&apikey=%s",
                symbol, API_KEY
        );
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = mapper.readTree(response.body());
            JsonNode quote = root.path("Global Quote");
            String priceStr = quote.path("05. price").asText();
            if (priceStr.isEmpty()) return null;
            return Double.parseDouble(priceStr);
        } catch (Exception e) {
            System.err.println("Failed to fetch " + symbol + ": " + e.getMessage());
            return null;
        }
    }
}

class PriceUpdateScheduler {
    private final ConcurrentHashMap<String, Double> priceCache = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final AlphaVantageClient client = new AlphaVantageClient();

    public void startBackgroundUpdates(TransactionDao dao) {
        scheduler.scheduleAtFixedRate(() -> {
            try {
                List<String> symbols = dao.findDistinctSymbols();
                if (symbols.isEmpty()) return;
                System.out.println("\n[Background] Fetching latest prices for: " + symbols);
                for (String symbol : symbols) {
                    Double price = client.fetchCurrentPrice(symbol);
                    if (price != null) {
                        priceCache.put(symbol, price);
                    }
                }
            } catch (Exception e) {
                System.err.println("Background update failed: " + e.getMessage());
            }
        }, 0, 60, TimeUnit.SECONDS);
    }

    public Double getCachedPrice(String symbol) {
        return priceCache.get(symbol);
    }

    public void shutdown() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}

class PortfolioService {
    private final TransactionDao dao;
    private final PriceUpdateScheduler scheduler;

    public PortfolioService(TransactionDao dao, PriceUpdateScheduler scheduler) {
        this.dao = dao;
        this.scheduler = scheduler;
    }

    public void printSummary() {
        List<Transaction> all = dao.findAll();
        Map<String, Double> holdings = new HashMap<>();
        double totalCost = 0.0;
        for (Transaction t : all) {
            double signedQty = t.getType().equals("BUY") ? t.getQuantity() : -t.getQuantity();
            holdings.merge(t.getSymbol(), signedQty, Double::sum);
            if (t.getType().equals("BUY")) {
                totalCost += t.getQuantity() * t.getPrice();
            }
        }
        System.out.println("\n======= PORTFOLIO SUMMARY =======");
        double totalMarketValue = 0.0;
        for (Map.Entry<String, Double> entry : holdings.entrySet()) {
            String symbol = entry.getKey();
            double qty = entry.getValue();
            if (qty == 0) continue;
            Double currentPrice = scheduler.getCachedPrice(symbol);
            if (currentPrice == null) {
                System.out.printf("%s: %s shares (Price unavailable)%n", symbol, qty);
                continue;
            }
            double marketVal = qty * currentPrice;
            totalMarketValue += marketVal;
            System.out.printf("%s: %s shares @ $%.2f = $%.2f%n", symbol, qty, currentPrice, marketVal);
        }
        double unrealizedPL = totalMarketValue - totalCost;
        System.out.printf("Total Market Value: $%.2f | Unrealized P&L: $%.2f | Realized P&L: $%.2f%n",
                totalMarketValue, unrealizedPL, 0.0);
    }
}

class JpaUtil {
    private static final EntityManagerFactory emf;

    static {
        Configuration cfg = new Configuration()
                .addAnnotatedClass(Transaction.class)
                .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                .setProperty("hibernate.connection.url", "jdbc:h2:mem:portfolio;DB_CLOSE_DELAY=-1")
                .setProperty("hibernate.connection.username", "sa")
                .setProperty("hibernate.connection.password", "")
                .setProperty("hibernate.hbm2ddl.auto", "create-drop")
                .setProperty("hibernate.show_sql", "false")
                .setProperty("hibernate.format_sql", "false")
                .setProperty("hibernate.dialect", "org.hibernate.dialect.H2Dialect");
        SessionFactory sessionFactory = cfg.buildSessionFactory();
        emf = sessionFactory.unwrap(EntityManagerFactory.class);
    }

    public static EntityManager getEntityManager() {
        return emf.createEntityManager();
    }

    public static void close() {
        emf.close();
    }
}

public class Main {
    private static final TransactionDao dao = new TransactionDao();
    private static final PriceUpdateScheduler scheduler = new PriceUpdateScheduler();
    private static final PortfolioService service = new PortfolioService(dao, scheduler);

    public static void main(String[] args) {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            scheduler.shutdown();
            JpaUtil.close();
        }));

        scheduler.startBackgroundUpdates(dao);
        Scanner scanner = new Scanner(System.in);
        System.out.println("=== Portfolio Tracker CLI ===");
        System.out.println("Commands: [add] [summary] [list] [quit]");

        while (true) {
            System.out.print("> ");
            String input = scanner.nextLine().trim().toLowerCase();
            if (input.equals("quit")) break;

            switch (input) {
                case "add" -> {
                    System.out.print("Symbol: ");
                    String sym = scanner.nextLine().toUpperCase();
                    System.out.print("Type (BUY/SELL): ");
                    String type = scanner.nextLine().toUpperCase();
                    System.out.print("Quantity: ");
                    double qty = scanner.nextDouble();
                    scanner.nextLine();
                    System.out.print("Price per share: ");
                    double price = scanner.nextDouble();
                    scanner.nextLine();
                    dao.save(new Transaction(sym, type, qty, price, LocalDateTime.now()));
                    System.out.println("Transaction added!");
                }
                case "summary" -> service.printSummary();
                case "list" -> dao.findAll().forEach(System.out::println);
                default -> System.out.println("Unknown command.");
            }
        }
        scanner.close();
        scheduler.shutdown();
        JpaUtil.close();
    }
}
