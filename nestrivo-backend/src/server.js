import "dotenv/config";
import app from "./app.js";
import { checkAndAutoExpireWarningReports } from "./controller/report.controller.js";
import { checkAndExpirePromotions } from "./controller/promotion.controller.js";

const PORT = process.env.PORT || 5000;

// Khởi chạy tác vụ tự động kiểm tra vi phạm cảnh báo 24h & hết hạn gói quảng bá
checkAndAutoExpireWarningReports().catch((err) =>
  console.error("[AutoModeration] Lỗi khi kiểm tra hết hạn cảnh báo 24h ban đầu:", err)
);
checkAndExpirePromotions().catch((err) =>
  console.error("[PromotionEngine] Lỗi khi kiểm tra hết hạn gói đẩy tin ban đầu:", err)
);

setInterval(() => {
  checkAndAutoExpireWarningReports().catch((err) =>
    console.error("[AutoModeration] Lỗi khi kiểm tra hết hạn cảnh báo 24h định kỳ:", err)
  );
  checkAndExpirePromotions().catch((err) =>
    console.error("[PromotionEngine] Lỗi khi kiểm tra hết hạn gói đẩy tin định kỳ:", err)
  );
}, 10 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Nestrivo API running at http://localhost:${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
