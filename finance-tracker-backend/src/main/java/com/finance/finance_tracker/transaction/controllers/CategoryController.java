package com.finance.finance_tracker.transaction.controllers;

import com.finance.finance_tracker.transaction.dtos.CategoryLimitResponseDTO;
import com.finance.finance_tracker.transaction.dtos.UpdateCategoryLimitDTO;
import com.finance.finance_tracker.transaction.models.Category;
import com.finance.finance_tracker.transaction.repositories.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<CategoryLimitResponseDTO>> getCategories() {
        List<CategoryLimitResponseDTO> categories = categoryRepository.findAll().stream()
                .map(category -> new CategoryLimitResponseDTO(
                        category.getId(),
                        category.getName(),
                        category.getMonthlyLimit()))
                .toList();
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}/monthly-limit")
    public ResponseEntity<CategoryLimitResponseDTO> updateMonthlyLimit(
            @PathVariable Long id,
            @RequestBody UpdateCategoryLimitDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Catégorie introuvable."));

        category.setMonthlyLimit(request.monthlyLimit());
        Category savedCategory = categoryRepository.save(category);

        return ResponseEntity.ok(new CategoryLimitResponseDTO(
                savedCategory.getId(),
                savedCategory.getName(),
                savedCategory.getMonthlyLimit()));
    }
}